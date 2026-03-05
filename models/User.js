import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: { type: String },
  verificationTokenExpiry: { type: Date },
  profile: {
    displayName: { type: String },
    bio: { type: String },
    avatarUrl: { type: String },
    platformFeePercentage: { type: Number, default: 10, min: 10, max: 50 },
    currency: { type: String, default: "ARS" },
    minAmount: { type: Number, default: 500 },
  },
  integrations: {
    discordWebhook: { type: String },
    obsKey: { type: String },
    obsOverlayColor: { type: String, default: "#ffffff" },
    obsOverlayAlignment: { type: String, default: "center", enum: ["left", "center", "right"] },
  },
  mercadopago: {
    access_token: { type: String },
    public_key: { type: String },
    refresh_token: { type: String },
    user_id: { type: String },
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
