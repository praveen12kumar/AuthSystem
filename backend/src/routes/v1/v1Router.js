import express from 'express';

import courseRouter from './courses.js';
import sectionRouter from './sections.js';
import tagRouter from './tags.js';
import userRouter from './users.js';

const router = express.Router();

router.use('/users', userRouter);
router.use('/tags', tagRouter);
router.use('/courses', courseRouter);
router.use('/sections', sectionRouter);

export default router;
