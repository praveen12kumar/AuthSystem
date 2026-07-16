import SubSection from '../schema/subSectionSchema.js';
import crudRepository from './crudRepository.js';

const subSectionRepository = {
  ...crudRepository(SubSection),

  getBySection: async function (sectionId) {
    const response = await SubSection.find({ section: sectionId });
    return response;
  }
};

export default subSectionRepository;
