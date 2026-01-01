
import { createWalletClient, http, publicActions, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'
import fs from 'fs'
import path from 'path'
import solc from 'solc'
import { fileURLToPath } from 'url';

// Helper for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables manually
const envPath = path.resolve(__dirname, '../.env')
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8')
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=')
        if (key && value) {
            process.env[key.trim()] = value.trim()
        }
    })
}

const PRIVATE_KEY = process.env.PRIVATE_KEY
if (!PRIVATE_KEY) {
    console.error('Missing PRIVATE_KEY in .env')
    process.exit(1)
}

function findImports(importPath) {
    if (importPath.startsWith('@openzeppelin')) {
        const nodeModulesPath = path.resolve(__dirname, '../node_modules', importPath)
        try {
            const content = fs.readFileSync(nodeModulesPath, 'utf8')
            return { contents: content }
        } catch (e) {
            return { error: 'File not found' }
        }
    }
    return { error: 'File not found' }
}

async function main() {
    console.log("Compiling contract...")
    const contractPath = path.resolve(__dirname, '../contracts/PerfectCircleReport.sol')
    const source = fs.readFileSync(contractPath, 'utf8')

    const input = {
        language: 'Solidity',
        sources: {
            'PerfectCircleReport.sol': {
                content: source,
            },
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*'],
                },
            },
        },
    }

    const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }))

    if (output.errors) {
        let hasError = false
        for (const error of output.errors) {
            console.error(error.formattedMessage)
            if (error.severity === 'error') hasError = true
        }
        if (hasError) process.exit(1)
    }

    const contractFile = output.contracts['PerfectCircleReport.sol']['PerfectCircleReport']
    const abi = contractFile.abi
    const bytecode = contractFile.evm.bytecode.object

    console.log("Compilation successful!")
    console.log("Deploying to Base Mainnet...")

    const account = privateKeyToAccount(PRIVATE_KEY)
    const client = createWalletClient({
        account,
        chain: base,
        transport: http()
    }).extend(publicActions)

    const hash = await client.deployContract({
        abi,
        bytecode: `0x${bytecode}`,
        args: [],
    })

    console.log(`Transaction sent: ${hash}`)

    const receipt = await client.waitForTransactionReceipt({ hash })

    if (receipt.contractAddress) {
        console.log(`Contract deployed at: ${receipt.contractAddress}`)
        // Write address to a file that frontend can import? 
        // Or just log it and I'll manually update the frontend file in the next step. 
        // Writing to a JSON file is safer for automation.
        fs.writeFileSync(path.resolve(__dirname, '../src/contract-address.json'), JSON.stringify({ address: receipt.contractAddress }, null, 2))
        // Also write ABI
        fs.writeFileSync(path.resolve(__dirname, '../src/contract-abi.json'), JSON.stringify(abi, null, 2))
    } else {
        console.error("Deployment failed, no contract address returned.")
    }
}

main().catch(console.error)
