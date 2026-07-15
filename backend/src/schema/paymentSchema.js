import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required"],
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: [true, "Course is required"],
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
    min: 0,
  },
  currency: {
    type: String,
    default: "INR",
  },
  status: {
    type: String,
    enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
    default: "PENDING",
  },
  paymentGateway: {
    type: String,
    trim: true,
  },
  gatewayOrderId: {
    type: String,
    trim: true,
  },
  gatewayPaymentId: {
    type: String,
    trim: true,
  },
  gatewaySignature: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

paymentSchema.index({ gatewayOrderId: 1 }, { unique: true, sparse: true });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
