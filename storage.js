const { ShareServiceClient, StorageSharedKeyCredential } = require('@azure/storage-file-share');
require('dotenv').config();

const sharedKeyCredential = new StorageSharedKeyCredential(process.env.FILES_STORAGE_ACCOUNT_NAME, process.env.FILES_STORAGE_ACCOUNT_KEY);

const serviceClient = new ShareServiceClient(
    `https://${process.env.FILES_STORAGE_ACCOUNT_NAME}.file.core.windows.net`,
    sharedKeyCredential
);

async function uploadFileToAzureFiles(fileBuffer, fileName) {
    const shareClient = serviceClient.getShareClient(process.env.FILES_SHARE_NAME);
    const directoryClient = shareClient.getDirectoryClient(process.env.FILES_DIRECTORY_NAME);
    const fileClient = directoryClient.getFileClient(fileName);

    console.log(`Uploading file to Azure Files: ${fileName} `);
    await fileClient.uploadData(fileBuffer, fileBuffer.length);
    console.log(`File uploaded: ${fileName} `);
}

module.exports = {
    uploadFileToAzureFiles
};