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
  }
};

export default paymentRepository;
