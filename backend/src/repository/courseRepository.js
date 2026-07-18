import Course from '../schema/courseSchema.js';
import crudRepository from './crudRepository.js';

const courseRepository = {
  ...crudRepository(Course),

  getByInstructor: async function (instructorId) {
    const response = await Course.find({ instructor: instructorId });
    return response;
  },

  addSection: async function (courseId, sectionId) {
    const response = await Course.findByIdAndUpdate(
      courseId,
      { $push: { sections: sectionId } },
      { new: true }
    );
    return response;
  },

  removeSection: async function (courseId, sectionId) {
    const response = await Course.findByIdAndUpdate(
      courseId,
      { $pull: { sections: sectionId } },
      { new: true }
    );
    return response;
  },

  addStudent: async function (courseId, userId) {
    const response = await Course.findByIdAndUpdate(
      courseId,
      { $addToSet: { studentsEnrolled: userId } },
      { new: true }
    );
    return response;
  }
};

export default courseRepository;
