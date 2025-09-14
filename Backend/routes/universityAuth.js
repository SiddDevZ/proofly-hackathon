import { Hono } from 'hono';
import University from '../models/University.js';
import Student from '../models/Student.js';
import { generateRandomToken } from '../utils/tokenGenerator.js';
import universityAuthMiddleware from '../middleware/universityAuthMiddleware.js';

const universityAuth = new Hono();

universityAuth.get('/list', async (c) => {
  try {
    const universities = await University.find({}, 'universityName _id').sort({ universityName: 1 });
    return c.json({
      universities: universities.map(uni => ({
        id: uni._id,
        name: uni.universityName
      }))
    });
  } catch (error) {
    console.error('Fetch universities error:', error);
    return c.json({ error: 'Failed to fetch universities' }, 500);
  }
});

universityAuth.post('/register', async (c) => {
    try {
        const { universityName, email, password } = await c.req.json();
        
        const existingUniversity = await University.findOne({ email });
        if (existingUniversity) {
            return c.json({ error: 'University with this email already exists' }, 400);
        }

        const token = generateRandomToken();

        const newUniversity = new University({
            universityName,
            email,
            password,
            token,
        });
        await newUniversity.save();

        return c.json({ token });

    } catch (error) {
        console.error(error);
        return c.json({ error: 'Server error' }, 500);
    }
});

universityAuth.post('/login', async (c) => {
    try {
        const { email, password } = await c.req.json();
        const university = await University.findOne({ email });
        if (!university || university.password !== password) {
            return c.json({ error: 'Invalid credentials' }, 400);
        }
        
        const token = generateRandomToken();
        university.token = token;
        await university.save();
        return c.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        return c.json({ error: 'Server error' }, 500);
    }
});

universityAuth.post('/verify', async (c) => {
    try {
        const { token } = await c.req.json();
        const university = await University.findOne({ token }).select('-password');
        if (!university) {
            return c.json({ valid: false });
        }
        return c.json({ valid: true, university });
    } catch (error) {
        console.error('Token verification error:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

universityAuth.get('/students', universityAuthMiddleware, async (c) => {
    try {
        const university = c.get('university');
        const students = await Student.find({ university: university._id }).select('name email _id');
        return c.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        return c.json({ error: 'Server error' }, 500);
    }
});

universityAuth.get('/list', async (c) => {
    try {
        const universities = await University.find({}).select('_id universityName').lean();
        const formattedUniversities = universities.map(uni => ({
            id: uni._id,
            name: uni.universityName
        }));
        return c.json({ universities: formattedUniversities });
    } catch (error) {
        console.error('Error fetching universities:', error);
        return c.json({ error: 'Server error' }, 500);
    }
});


export default universityAuth;
