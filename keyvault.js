const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');
require('dotenv').config();

// デフォルトのAzureクレデンシャルを使用
const credential = new DefaultAzureCredential();

// SecretClientの作成
const client = new SecretClient(process.env.KEY_VAULT_URL, credential);

// シークレットを取得する関数
async function getSecret() {
    try {
        const secret = await client.getSecret("orion-test");
        return secret.value;
    } catch (error) {
        console.error(`Error getting secret orion-test:`, error);
        throw error;
    }
}

module.exports = { getSecret };