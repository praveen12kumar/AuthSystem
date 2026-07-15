import Course from '../schema/courseSchema.js';
import crudRepository from './crudRepository.js';

const courseRepository = {
  ...crudRepository(Course),

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
  }
};

export default courseRepository;
