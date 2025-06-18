const Redis = require('ioredis');
const CustomError = require('../../shared-libs/errors/CustomError');

const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 60 * 5; // seconds (5 minutes)

async function checkLoginAttempt(email) {
  const key = `login_attempt:${email.toLowerCase()}`;

  const count = await connection.incr(key);

  if (count === 1) {
    await connection.expire(key, LOCK_DURATION);
  }

  if (count > MAX_ATTEMPTS) {
    throw new CustomError(
      'Too many failed login attempts. Please try again after 5 minutes.',
      429
    );
  }
}

module.exports = { checkLoginAttempt };
