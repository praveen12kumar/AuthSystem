import Review from '../schema/reviewSchema.js';
import crudRepository from './crudRepository.js';

const reviewRepository = {
  ...crudRepository(Review),

  getByCourse: async function (courseId) {
    const response = await Review.find({ course: courseId }).sort({ createdAt: -1 });
    return response;
  },

  getByUserAndCourse: async function (userId, courseId) {
    const response = await Review.findOne({ user: userId, course: courseId });
    return response;
  }
};

export default reviewRepository;
