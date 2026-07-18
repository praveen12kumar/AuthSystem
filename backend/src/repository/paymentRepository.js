import Payment from '../schema/paymentSchema.js';
import crudRepository from './crudRepository.js';

const paymentRepository = {
  ...crudRepository(Payment),

  getByOrderId: async function (orderId) {
    const response = await Payment.findOne({ gatewayOrderId: orderId });
    return response;
  }
};

export default paymentRepository;
