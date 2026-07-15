import Course from '../schema/courseSchema.js';
import crudRepository from './crudRepository.js';

const courseRepository = {
  ...crudRepository(Course)
};

export default courseRepository;
