import User from "../schema/userSchema.js";
import crudRepository from "./crudRepository.js";

const userRepository = {
    ...crudRepository(User),

    getByEmail: async function (email) {
        const response = await User.findOne({ email: email });
        return response;
    }
};

export default userRepository;
