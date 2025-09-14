import mongoose from 'mongoose';

const credentialSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  title: { type: String, required: true },
  imagePath: { type: String, required: true },
  credentialHash: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  blockchainTxHash: { type: String, default: null }, // Polygon transaction hash
  issueDate: { type: Date, default: Date.now }
});

export default mongoose.model('Credential', credentialSchema); 