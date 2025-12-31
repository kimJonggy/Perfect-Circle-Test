import axios from 'axios';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;

if (!PINATA_API_KEY || !PINATA_API_SECRET) {
    console.warn("Missing Pinata API Keys in .env");
}

export const uploadFileToIPFS = async (file: Blob): Promise<string> => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    const data = new FormData();
    data.append('file', file);

    const Metadata = JSON.stringify({
        name: `circle-report-${Date.now()}`,
    });
    data.append('pinataMetadata', Metadata);

    const pinataOptions = JSON.stringify({
        cidVersion: 0,
    });
    data.append('pinataOptions', pinataOptions);

    try {
        const response = await axios.post(url, data, {
            maxBodyLength: Infinity,
            headers: {
                'Content-Type': `multipart/form-data`,
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_API_SECRET,
            },
        });
        return response.data.IpfsHash;
    } catch (error) {
        console.error("Error uploading file to Pinata:", error);
        throw error;
    }
};

export const uploadJSONToIPFS = async (body: object): Promise<string> => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

    try {
        const response = await axios.post(url, body, {
            headers: {
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_API_SECRET,
            },
        });
        return response.data.IpfsHash;
    } catch (error) {
        console.error("Error uploading JSON to Pinata:", error);
        throw error;
    }
};
