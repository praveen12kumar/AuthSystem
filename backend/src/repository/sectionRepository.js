import Section from '../schema/sectionSchema.js';
import crudRepository from './crudRepository.js';

const sectionRepository = {
  ...crudRepository(Section),

  getByCourse: async function (courseId) {
    const response = await Section.find({ course: courseId });
    return response;
  },

  deleteByCourse: async function (courseId) {
    const response = await Section.deleteMany({ course: courseId });
    return response;
  },

  addSubSection: async function (sectionId, subSectionId) {
    const response = await Section.findByIdAndUpdate(
      sectionId,
      { $push: { subSections: subSectionId } },
      { new: true }
    );
    return response;
  },

  removeSubSection: async function (sectionId, subSectionId) {
    const response = await Section.findByIdAndUpdate(
      sectionId,
      { $pull: { subSections: subSectionId } },
      { new: true }
    );
    return response;
  }
};

export default sectionRepository;
