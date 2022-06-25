const { createClient } = require('redis');

const RedisClient = createClient(6379);

RedisClient.connect();

RedisClient.on('connect', () => console.log('Redis connected'));
RedisClient.on('error', (err) => console.log('Redis Client Error', err));


module.exports = RedisClient;

