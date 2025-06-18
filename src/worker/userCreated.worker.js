const { Worker } = require('bullmq');
const Redis = require('ioredis');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');
const service = require('../services/index');
const { resetRedis } = require('../../shared-libs/utils/redis.config');

const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null
});
const worker = new Worker('CREATE_USER', async (job) => {
  const { email, password, position } = job.data;

    // console.log(`📥 Received CREATE_USER event: ${JSON.stringify(data)}`);
  console.log(`📥 Received CREATE_USER event for email: ${email}, position: ${position}`);

  await service.authService.register(email, password,position)
  

  logger.info(`User ${email} created successfully from job ${job.id}`);
  
}, { connection });

worker.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed: ${err.message}`);
});
