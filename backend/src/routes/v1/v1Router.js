import express from 'express';

import tagRouter from './tags.js';
import userRouter from './users.js';

const router = express.Router();

router.use('/users', userRouter);
router.use('/tags', tagRouter);

export default router;
