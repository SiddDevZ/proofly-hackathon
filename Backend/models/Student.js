import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
  credentials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Credential' }],
  token: { type: String, unique: true, sparse: true }
});

export default mongoose.model('Student', studentSchema);
