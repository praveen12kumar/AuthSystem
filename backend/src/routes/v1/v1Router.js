import express from 'express';

import courseProgressRouter from './courseProgress.js';
import courseRouter from './courses.js';
import paymentRouter from './payments.js';
import reviewRouter from './reviews.js';
import sectionRouter from './sections.js';
import subSectionRouter from './subsections.js';
import tagRouter from './tags.js';
import userRouter from './users.js';

const router = express.Router();

router.use('/users', userRouter);
router.use('/tags', tagRouter);
router.use('/courses', courseRouter);
router.use('/sections', sectionRouter);
router.use('/subsections', subSectionRouter);
router.use('/payments', paymentRouter);
router.use('/course-progress', courseProgressRouter);
router.use('/reviews', reviewRouter);

export default router;
