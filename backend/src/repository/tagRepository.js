import Tag from '../schema/tagSchema.js';
import crudRepository from './crudRepository.js';

const tagRepository = {
  ...crudRepository(Tag),

  getByName: async function (name) {
    const response = await Tag.findOne({ name });
    return response;
  },

  findByIds: async function (ids) {
    const response = await Tag.find({ _id: { $in: ids } });
    return response;
  }
};

export default tagRepository;
