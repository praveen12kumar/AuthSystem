import User from "../schema/userSchema.js";
import crudRepository from "./crudRepository.js";

const userRepository = {
    ...crudRepository(User),

    getByEmail: async function (email) {
        const response = await User.findOne({ email: email });
        return response;
    },

    addCourse: async function (userId, courseId) {
        const response = await User.findByIdAndUpdate(
            userId,
            { $push: { courses: courseId } },
            { new: true }
        );
        return response;
    },

    removeCourse: async function (userId, courseId) {
        const response = await User.findByIdAndUpdate(
            userId,
            { $pull: { courses: courseId } },
            { new: true }
        );
        return response;
    }
};

export default userRepository;
