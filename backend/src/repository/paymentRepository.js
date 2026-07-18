import Payment from '../schema/paymentSchema.js';
import crudRepository from './crudRepository.js';

const paymentRepository = {
  ...crudRepository(Payment),

  getByOrderId: async function (orderId) {
    const response = await Payment.findOne({ gatewayOrderId: orderId });
    return response;
  },

  getByUser: async function (userId) {
    const response = await Payment.find({ user: userId, status: 'SUCCESS' }).sort({
      createdAt: -1
    });
    return response;
  },

  getByCourses: async function (courseIds) {
    const response = await Payment.find({
      course: { $in: courseIds },
      status: 'SUCCESS'
    });
    return response;
  }
};

export default paymentRepository;
