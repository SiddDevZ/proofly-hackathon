import mongoose from 'mongoose';

const universitySchema = new mongoose.Schema({
  universityName: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  token: { type: String, unique: true, sparse: true }
});

export default mongoose.model('University', universitySchema);
