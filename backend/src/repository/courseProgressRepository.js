import CourseProgress from '../schema/courseProgressSchema.js';
import crudRepository from './crudRepository.js';

const courseProgressRepository = {
  ...crudRepository(CourseProgress),

  getByUserAndCourse: async function (userId, courseId) {
    const response = await CourseProgress.findOne({ user: userId, course: courseId });
    return response;
  },

  markComplete: async function (userId, courseId, subSectionId) {
    const response = await CourseProgress.findOneAndUpdate(
      { user: userId, course: courseId },
      { $addToSet: { completedSubSections: subSectionId } },
      { new: true, upsert: true }
    );
    return response;
  }
};

export default courseProgressRepository;
