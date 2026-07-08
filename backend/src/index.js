import cors from 'cors';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import sanitize from 'mongo-sanitize';

import connectDB from './config/dbConfig.js';
import { CLIENT_URL } from './config/serverConfig.js';
import { PORT } from './config/serverConfig.js';
import redis from './libs/redisConfig.js';
import apiRouter from './routes/apiRoutes.js';

const app = express();


/** ---------- Enable CORS ---------- */
app.use(cors({
  origin: CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type','x-access-token', 'Authorization'],
  credentials: true,
}));

/**------------Allow json and urlencoded data-------- */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/** ---------- Global sanitization (before routes) ---------- */
app.use((req, _res, next) => {
  // mongo-sanitize mutates the object in place; reassigning req.query throws
  // in Express 5, where req.query is a getter-only accessor.
  ['body', 'params', 'query'].forEach((k) => {
    if (req[k]) sanitize(req[k]);
  });
  next();
});


/** ---------- Health & base routes ---------- */
app.get('/', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'Hello, World!' });
});

app.use('/api', apiRouter);


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

