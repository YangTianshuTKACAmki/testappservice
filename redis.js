const { ShareServiceClient, StorageSharedKeyCredential } = require("@azure/storage-file-share");
const redis = require("redis");
require('dotenv').config();

// Azure Storage Accountの情報
const fileName = "uploaded-file.txt"; // 取得するファイル名

// StorageSharedKeyCredentialオブジェクトを作成
const sharedKeyCredential = new StorageSharedKeyCredential(process.env.FILES_STORAGE_ACCOUNT_NAME, process.env.FILES_STORAGE_ACCOUNT_KEY);


// ShareServiceClientオブジェクトを作成
const serviceClient = new ShareServiceClient(
    `https://${process.env.FILES_STORAGE_ACCOUNT_NAME}.file.core.windows.net`,
    sharedKeyCredential
);

async function getFileContentsFromAzureFiles() {
    try {
        // Connection configuration
        const cacheConnection = redis.createClient({
            // rediss for TLS
            url: `rediss://${process.env.REDIS_HOST_NAME}:6380`,
            password: process.env.RADIS_ACCESS_KEY
        });

        // Connect to Redis
        await cacheConnection.connect();

        // ShareClientを取得
        const shareClient = serviceClient.getShareClient(process.env.FILES_SHARE_NAME);

        // DirectoryClientを取得
        const directoryClient = shareClient.getDirectoryClient(process.env.FILES_DIRECTORY_NAME);

        // FileClientを取得
        const fileClient = directoryClient.getFileClient(fileName);

        // ファイルの内容をバッファとして取得
        const downloadResponse = await fileClient.download();
        const fileContent = await streamToString(downloadResponse.readableStreamBody);

        // Redisにファイルの内容を保存
        await cacheConnection.set("orion-test-content", fileContent);
        console.log("File content saved in Redis.");
        var result = await cacheConnection.get("orion-test-content");
        return result;
    } catch (error) {
        console.error("Error getting file from Azure Files or setting value in Redis:", error.message);
        throw error;
    }
}

// Streamを文字列に変換するユーティリティ関数
async function streamToString(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (data) => {
            chunks.push(data.toString());
        });
        readableStream.on("end", () => {
            resolve(chunks.join(""));
        });
        readableStream.on("error", reject);
    });
}

module.exports = {
    getFileContentsFromAzureFiles
};