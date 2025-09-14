import University from '../models/University.js';

const universityAuthMiddleware = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const university = await University.findOne({ token }).select('-password');
    if (!university) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    c.set('university', university);
    await next();
  } catch (error) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
};

export default universityAuthMiddleware; 