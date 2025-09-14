import { Hono } from 'hono';
import Student from '../models/Student.js';
import { generateRandomToken } from '../utils/tokenGenerator.js';

const studentAuth = new Hono();

studentAuth.post('/register', async (c) => {
    try {
        const { name, email, password, university } = await c.req.json();
        
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return c.json({ error: 'Student with this email already exists' }, 400);
        }

        const token = generateRandomToken();

        const studentData = {
            name,
            email,
            password,
            token,
        };

        if (university) {
            studentData.university = university;
        }

        const newStudent = new Student(studentData);
        await newStudent.save();

        return c.json({ token });

    } catch (error) {
        console.error('Student registration error:', error);
        return c.json({ error: 'Server error' }, 500);
    }
});

studentAuth.post('/login', async (c) => {
    try {
        const { email, password } = await c.req.json();
        const student = await Student.findOne({ email });
        if (!student || student.password !== password) {
            return c.json({ error: 'Invalid credentials' }, 400);
        }
        
        const token = generateRandomToken();
        student.token = token;
        await student.save();
        return c.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        return c.json({ error: 'Server error' }, 500);
    }
});

studentAuth.post('/verify', async (c) => {
    try {
        const { token } = await c.req.json();
        const student = await Student.findOne({ token }).select('-password').populate('university', 'universityName');
        if (!student) {
            return c.json({ valid: false });
        }
        const studentData = {
            ...student.toObject(),
            universityName: student.university?.universityName || 'No University Assigned'
        };

        return c.json({ valid: true, student: studentData });
    } catch (error) {
        console.error('Token verification error:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

export default studentAuth;
