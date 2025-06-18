const Redis = require('ioredis');
const CustomError = require('../../shared-libs/errors/CustomError');
const redis = new Redis(); // mặc định localhost:6379

const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 60 * 5; // seconds (5 minutes)

async function checkLoginAttempt(email) {
  const key = `login_attempt:${email.toLowerCase()}`;

  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, LOCK_DURATION);
  }

  if (count > MAX_ATTEMPTS) {
    throw new CustomError(
      'Too many failed login attempts. Please try again after 5 minutes.',
      429
    );
  }
}

module.exports = { checkLoginAttempt };
