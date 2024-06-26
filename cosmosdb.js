const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE;
const containerId = process.env.COSMOS_DB_CONTAINER;

const client = new CosmosClient({ endpoint, key });

async function fetchItems() {
    const database = client.database(databaseId);
    const container = database.container(containerId);
    const querySpec = {
        query: 'SELECT * FROM c'
    };

    const { resources: items } = await container.items.query(querySpec).fetchAll();
    return items;
}

module.exports = {
    fetchItems
};