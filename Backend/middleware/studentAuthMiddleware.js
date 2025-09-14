import Student from '../models/Student.js';

const studentAuthMiddleware = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const student = await Student.findOne({ token }).select('-password');
    if (!student) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    c.set('student', student);
    await next();
  } catch (error) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
};

export default studentAuthMiddleware; 