import User from "../schema/userSchema.js";
import crudRepository from "./crudRepository.js";

const userRepository = {
    ...crudRepository(User),

    getByEmail: async function (email) {
        const response = await User.findOne({ email: email });
        return response;
    },

    getProfileById: async function (userId) {
        const response = await User.findById(userId).select('-password');
        return response;
    },

    getAllExcludingPassword: async function () {
        const response = await User.find().select('-password').sort({ createdAt: -1 });
        return response;
    },

    updateRole: async function (userId, role) {
        const response = await User.findByIdAndUpdate(
            userId,
            { $set: { role } },
            { new: true, runValidators: true, context: 'query' }
        ).select('-password');
        return response;
    },

    updateProfile: async function (userId, updates) {
        const response = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true, context: 'query' }
        ).select('-password');
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
