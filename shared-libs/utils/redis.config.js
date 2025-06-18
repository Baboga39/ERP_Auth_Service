const { createClient } = require('redis');

const redis = createClient({
  username: 'default',
  password: 'nmRBH4xn7cdR98RRdIoX3N90FzG1eXR4',
  socket: {
    host: 'redis-10985.crce194.ap-seast-1-1.ec2.redns.redis-cloud.com',
    port: 10985
  }
});

redis.on('error', err => console.error('❌ Redis Client Error:', err));

(async () => {
  await redis.connect();
  console.log('✅ Redis client connected');
})();




async function showAllRedisKeys(redisClient) {
  try {
    const keys = await redisClient.keys('*');
    if (keys.length === 0) {
      console.log('📭 Redis is empty');
      return;
    }

    for (const key of keys) {
      const type = await redisClient.type(key);
      let valuePreview = '';

      switch (type) {
        case 'string':
          valuePreview = await redisClient.get(key);
          break;
        case 'list':
          valuePreview = await redisClient.lrange(key, 0, -1);
          break;
        case 'set':
          valuePreview = await redisClient.smembers(key);
          break;
        case 'hash':
          valuePreview = await redisClient.hgetall(key);
          break;
        case 'zset':
          valuePreview = await redisClient.zrange(key, 0, -1, 'WITHSCORES');
          break;
        case 'stream':
          valuePreview = '[Stream]';
          break;
        default:
          valuePreview = '[Unknown type]';
      }

      console.log(`🔑 ${key} (${type}) →`, valuePreview);
    }
  } catch (err) {
    console.error(`❌ Error showing Redis keys: ${err.message}`);
  }
}



async function resetRedis(redisClient) {
  try {
    await redisClient.flushAll();
    console.log('🧹 Redis has been cleared!');
  } catch (err) {
    console.error(`❌ Error resetting Redis: ${err.message}`);
  }
}

module.exports = {showAllRedisKeys, resetRedis};
