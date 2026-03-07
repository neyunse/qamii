import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  fanEmail: {
    type: String,
  },
  priceARS: {
    type: Number,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: "ARS",
    enum: ["ARS", "BRL", "CLP", "COP", "MXN", "PEN", "UYU"]
  },
  platformFeePercentage: {
    type: Number,
    default: 5,
  },
  feeAmount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'answered', 'refunded'],
    default: 'pending',
  },
  answer: {
    type: String,
  },
  paymentId: {
    type: String,
  },
}, { timestamps: true });

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);
