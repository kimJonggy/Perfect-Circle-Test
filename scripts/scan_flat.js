import fs from 'fs';
const content = fs.readFileSync('contracts/PerfectCircleReport_flat.sol', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.includes('SPDX') || line.includes('pragma solidity')) {
        console.log(`${index + 1}: ${line.trim()}`);
    }
});
