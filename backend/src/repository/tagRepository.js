import Tag from '../schema/tagSchema.js';
import crudRepository from './crudRepository.js';

const tagRepository = {
  ...crudRepository(Tag),

  getByName: async function (name) {
    const response = await Tag.findOne({ name });
    return response;
  }
};

export default tagRepository;
