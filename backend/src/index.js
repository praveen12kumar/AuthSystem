import app from './app.js';
import connectDB from './config/dbConfig.js';
import { PORT } from './config/serverConfig.js';
import redis from './libs/redisConfig.js';

/** ---------- Startup (fail fast on DB, degrade gracefully on Redis) ---------- */
const start = async()=>{
  try {
    await connectDB();

    try {
      await redis.ping();
      console.log('Connected to Redis');
    } catch (redisError) {
      console.log('Redis unavailable, starting without it. OTP-based features (signup, forgot-password) will not work until this is fixed:', redisError.message);
    }

    app.listen(PORT, ()=>{
      console.log(`Server is listening on port ${PORT}`);
    })
  } catch (error) {
    console.log('Startup failed: ', error);
    process.exit(1);
  }
};

start();
