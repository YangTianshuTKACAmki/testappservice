require('dotenv').config();
const { executeSql } = require('./sql');
const { fetchItems } = require('./cosmosdb');
const { uploadFileToAzureFiles } = require('./storage');
const { getFileContentsFromAzureFiles } = require('./redis');
const { getSecret } = require('./keyvault');
const express = require('express');

const app = express();
const port = 3000;

// サンプルデータ
var text = "This is GET request sample!!"

// テキストサンプルを取得するAPI
app.get("/api/sample", function (req, res) {
    res.json(text);
});

// SQL Databaseに接続してデータを取得するエンドポイント
app.get('/api/sql', async (req, res) => {
    try {
        const result = await executeSql();

        res.status(200).json({ "sqldb": result });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Cosmos DBに接続してデータを取得するエンドポイント
app.get('/api/cosmosdb', async (req, res) => {
    try {
        const items = await fetchItems();
        res.status(200).json({ "cosmosdb": items });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Storageに接続してデータを取得するエンドポイント
app.get('/api/storage', async (req, res) => {
    try {
        // ファイルがリクエストに含まれているかを確認
        if (!req.query.fileContent) {
            return res.status(400).json('fileContent parameters are required.');
        }
        const fileContent = req.query.fileContent;

        // Base64エンコードされたファイル内容をバッファに変換
        const fileBuffer = Buffer.from(fileContent, 'base64');
        const fileNameInAzureFiles = "uploaded-file.txt";
        await uploadFileToAzureFiles(fileBuffer, fileNameInAzureFiles);

        res.status(200).json({ success: "upload AzureFiles" });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// redisにデータを挿入するエンドポイント.
app.get('/api/redis', async (req, res) => {
    try {
        var result = await getFileContentsFromAzureFiles();
        res.status(200).json({ "redis": result });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// keyvaultからシークレットを取得するエンドポイント
app.get('/api/keyvault', async (req, res) => {
    try {
        const secret = await getSecret();
        res.status(200).json({ "keyvault": secret });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// 環境変数を取得するエンドポイント
app.get('/api/env', async (req, res) => {
    try {
        res.status(200).json({ "env": process.env.ENV_TEST_VALUE });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
});

var server = app.listen(port, function () {
    console.log("Node.js is listening to PORT: http://localhost:" + server.address().port);
});