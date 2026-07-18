import cors from 'cors';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import sanitize from 'mongo-sanitize';

import { CLIENT_URL } from './config/serverConfig.js';
import apiRouter from './routes/apiRoutes.js';

// Builds the Express app without starting a server or connecting to
// anything - kept separate from index.js so tests can import just the app
// (via supertest) and control their own DB connection, instead of
// triggering the real connectDB()/app.listen() side effects on import.
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

export default app;
