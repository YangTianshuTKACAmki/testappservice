const { Connection, Request } = require('tedious');
require('dotenv').config();
const { DefaultAzureCredential } = require('@azure/identity');

// Azure Identityを使用してアクセストークンを取得する関数
async function getAccessToken() {
    const credential = new DefaultAzureCredential();
    const tokenResponse = await credential.getToken('https://database.windows.net');
    return tokenResponse.token;
}

// SQLServerに接続してクエリを実行する関数
async function executeSql() {
    const token = await getAccessToken();

    const config = {
        server: process.env.SQL_SERVER_NAME,
        authentication: {
            type: 'azure-active-directory-access-token',
            options: {
                token: token
            }
        },
        options: {
            database: process.env.DATABASE_NAME,
            encrypt: true
        }
    };
    return new Promise((resolve, reject) => {
        const connection = new Connection(config);

        connection.on('connect', err => {
            if (err) {
                return reject(new Error('Connection error: ' + err.message));
            }
            var query = "SELECT * FROM Person";
            const request = new Request(query, (err, rowCount) => {
                if (err) {
                    return reject(new Error('Request error: ' + err.message));
                } else {
                    console.log('Rows count:', rowCount); // 行数を出力
                }
            });

            let result = [];

            request.on('row', columns => {
                let rowObject = {};
                columns.forEach(column => {
                    rowObject[column.metadata.colName] = column.value;
                });
                result.push(rowObject);
            });

            request.on('requestCompleted', () => {
                resolve(result);
            });

            request.on('error', err => {
                reject(new Error('Request error: ' + err.message));
            });

            connection.execSql(request);
        });

        connection.on('error', err => {
            reject(new Error('Connection error: ' + err.message));
        });

        connection.connect();
    });
}
module.exports = {
    executeSql
};