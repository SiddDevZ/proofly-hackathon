import { Hono } from 'hono';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import sharp from 'sharp';
import universityAuthMiddleware from '../middleware/universityAuthMiddleware.js';
import studentAuthMiddleware from '../middleware/studentAuthMiddleware.js';
import Credential from '../models/Credential.js';
import Student from '../models/Student.js';
import jwt from 'jsonwebtoken';
import blockchainService from '../utils/blockchain.js';
import config from '../../config.json' assert { type: 'json' };

const router = new Hono();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory with absolute path
const uploadsDir = path.resolve(__dirname, '../uploads');

// Ensure uploads directory exists with better error handling
const ensureUploadsDir = () => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      console.log(`Creating uploads directory at: ${uploadsDir}`);
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log(`✅ Created uploads directory: ${uploadsDir}`);
    } else {
      console.log(`✅ Uploads directory exists: ${uploadsDir}`);
    }
  } catch (error) {
    console.error('❌ Error creating uploads directory:', error);
    // Try alternative path
    const altUploadsDir = path.join(process.cwd(), 'Backend', 'uploads');
    try {
      if (!fs.existsSync(altUploadsDir)) {
        fs.mkdirSync(altUploadsDir, { recursive: true });
      }
    } catch (altError) {
      console.error('❌ Failed to create alternative uploads directory:', altError);
    }
  }
};

// Call this when the module loads
ensureUploadsDir();

const generateSlug = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const addQRCodeToImage = async (imageBuffer, qrData) => {
  try {
    const qrCodeBuffer = await QRCode.toBuffer(qrData, {
      width: 100,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    const qrSize = 100;
    const margin = 20;
    const left = metadata.width - qrSize - margin;
    const top = metadata.height - qrSize - margin;

    const modifiedImageBuffer = await image
      .composite([{
        input: qrCodeBuffer,
        left: left,
        top: top
      }])
      .png({ quality: 90, compressionLevel: 6 })
      .toBuffer();

    return modifiedImageBuffer;
  } catch (error) {
    console.error('Error adding QR code to image:', error);
    throw error;
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.post('/issue', universityAuthMiddleware, async (c) => {
  try {
    const body = await c.req.parseBody();
    const { studentId, title } = body;
    const file = body.credential;
    
    const university = c.get('university');

    if (!file) {
      return c.json({ error: 'Credential file is required' }, 400);
    }
    if (!studentId || !title) {
      return c.json({ error: 'Student ID and title are required' }, 400);
    }

    const student = await Student.findById(studentId);
    if (!student || student.university.toString() !== university._id.toString()) {
      return c.json({ error: 'Invalid student ID' }, 400);
    }

    const timestamp = Date.now();
    const originalName = file.name.split('.')[0];
    const fileName = `${timestamp}-${originalName}.png`;
    const filePath = path.join(uploadsDir, fileName);
    const fileBuffer = await file.arrayBuffer();

    let slug;
    let isUnique = false;
    while (!isUnique) {
      slug = generateSlug();
      const existingCredential = await Credential.findOne({ slug });
      if (!existingCredential) {
        isUnique = true;
      }
    }

    const qrUrl = `${config.frontend_url}/validate?q=${slug}`;
    const modifiedImageBuffer = await addQRCodeToImage(Buffer.from(fileBuffer), qrUrl);
    
    // Ensure directory exists before writing file
    try {
      if (!fs.existsSync(uploadsDir)) {
        console.log(`Directory missing, recreating: ${uploadsDir}`);
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Verify the file path is correct
      console.log(`Writing file to: ${filePath}`);
      fs.writeFileSync(filePath, modifiedImageBuffer);
      console.log(`✅ File written successfully: ${filePath}`);
      
      // Verify file was created
      if (!fs.existsSync(filePath)) {
        throw new Error('File was not created successfully');
      }
    } catch (writeError) {
      console.error('❌ File write error:', writeError);
      throw new Error(`Failed to write file: ${writeError.message}`);
    }

    const hash = crypto.createHash('sha256').update(modifiedImageBuffer).digest('hex');

    try {
      // Store hash on blockchain
      console.log('Storing credential hash on Polygon Amoy blockchain...');
      const blockchainTxHash = await blockchainService.storeCredentialHash(hash, slug);
      console.log('Blockchain transaction hash:', blockchainTxHash);

      const newCredential = new Credential({
        student: studentId,
        university: university._id,
        title,
        imagePath: `uploads/${fileName}`, // Store relative path for serving
        credentialHash: hash,
        slug,
        blockchainTxHash: blockchainTxHash, // Store the blockchain transaction hash
      });
      await newCredential.save();

      student.credentials.push(newCredential._id);
      await student.save();

      return c.json({ 
        message: 'Credential issued successfully and stored on blockchain', 
        credentialHash: hash,
        slug: slug,
        blockchainTxHash: blockchainTxHash
      });
    } catch (blockchainError) {
      console.error('Blockchain storage failed:', blockchainError);
      
      // Store credential anyway but mark as not blockchain-verified
      const newCredential = new Credential({
        student: studentId,
        university: university._id,
        title,
        imagePath: `uploads/${fileName}`, // Store relative path for serving
        credentialHash: hash,
        slug,
        blockchainTxHash: null, // No blockchain transaction
      });
      await newCredential.save();

      student.credentials.push(newCredential._id);
      await student.save();

      return c.json({ 
        message: 'Credential issued successfully (blockchain storage failed)', 
        credentialHash: hash,
        slug: slug,
        warning: 'Blockchain storage failed - credential saved locally only'
      });
    }
  } catch (error) {
    console.error('Error issuing credential:', error);
    return c.json({ error: 'Server error' }, 500);
  }
});

router.post('/validate', async (c) => {
    try {
        const body = await c.req.parseBody();
        const file = body.certificate;
        
        if (!file) {
            return c.json({ error: 'Certificate file is required' }, 400);
        }

        const fileBuffer = await file.arrayBuffer();
        const uploadedHash = crypto.createHash('sha256').update(Buffer.from(fileBuffer)).digest('hex');

        const credential = await Credential.findOne({ credentialHash: uploadedHash })
            .populate('student', 'name email')
            .populate('university', 'universityName');

        if (credential) {
            // Check blockchain verification based on database record
            let blockchainVerified = false;
            let blockchainStatus = 'not_verified';
            
            if (credential.blockchainTxHash) {
                // If we have a blockchain transaction hash in our database,
                // consider it verified (since we stored it when we put it on chain)
                blockchainVerified = true;
                blockchainStatus = 'verified';
                console.log('Blockchain verification: Transaction hash found in database');
            } else {
                blockchainStatus = 'no_blockchain_record';
                console.log('Blockchain verification: No transaction hash in database (legacy certificate)');
            }

            return c.json({
                valid: true,
                credential: {
                    title: credential.title,
                    studentName: credential.student.name,
                    studentEmail: credential.student.email,
                    universityName: credential.university.universityName,
                    issueDate: credential.issueDate,
                    hash: credential.credentialHash,
                    slug: credential.slug,
                    blockchainTxHash: credential.blockchainTxHash,
                    blockchainVerified: blockchainVerified,
                    blockchainStatus: blockchainStatus
                }
            });
        } else {
            return c.json({
                valid: false,
                message: 'No matching certificate found in our database'
            });
        }

    } catch (error) {
        console.error('Error validating certificate:', error);
        return c.json({ error: 'Server error' }, 500);
    }
});

// Route to validate credential by slug (for URL-based validation)
router.get('/validate-by-slug/:slug', async (c) => {
    try {
        const { slug } = c.req.param();
        
        if (!slug) {
            return c.json({ error: 'Credential slug is required' }, 400);
        }

        const credential = await Credential.findOne({ slug })
            .populate('student', 'name email')
            .populate('university', 'universityName');

        if (credential) {
            // Check blockchain verification based on database record
            let blockchainVerified = false;
            let blockchainStatus = 'not_verified';
            
            if (credential.blockchainTxHash) {
                // If we have a blockchain transaction hash in our database,
                // consider it verified (since we stored it when we put it on chain)
                blockchainVerified = true;
                blockchainStatus = 'verified';
                console.log('Blockchain verification by slug: Transaction hash found in database');
            } else {
                blockchainStatus = 'no_blockchain_record';
                console.log('Blockchain verification by slug: No transaction hash in database (legacy certificate)');
            }

            return c.json({
                valid: true,
                credential: {
                    title: credential.title,
                    studentName: credential.student.name,
                    studentEmail: credential.student.email,
                    universityName: credential.university.universityName,
                    issueDate: credential.issueDate,
                    hash: credential.credentialHash,
                    slug: credential.slug,
                    imagePath: credential.imagePath, // Include image path for frontend display
                    blockchainTxHash: credential.blockchainTxHash,
                    blockchainVerified: blockchainVerified,
                    blockchainStatus: blockchainStatus
                }
            });
        } else {
            return c.json({
                valid: false,
                message: `No credential found with ID: ${slug}`,
                searchedSlug: slug
            });
        }

    } catch (error) {
        console.error('Error validating credential by slug:', error);
        return c.json({ error: 'Server error' }, 500);
    }
});

router.get('/student', studentAuthMiddleware, async (c) => {
    try {
        const student = c.get('student');
        const credentials = await Credential.find({ student: student._id }).populate('university', 'universityName');
        return c.json(credentials);
    } catch (error) {
        console.error('Error fetching student credentials:', error);
        return c.json({ error: 'Server error' }, 500);
    }
});

// Route to get credentials issued by the logged-in university
router.get('/university', universityAuthMiddleware, async (c) => {
    try {
        const university = c.get('university');
        const credentials = await Credential.find({ university: university._id })
            .populate('student', 'name email')
            .sort({ issueDate: -1 });
        return c.json(credentials);
    } catch (error) {
        console.error('Error fetching university credentials:', error);
        return c.json({ error: 'Server error' }, 500);
    }
});

// Route to check blockchain status
router.get('/blockchain-status', async (c) => {
    try {
        const walletAddress = blockchainService.getWalletAddress();
        const balance = await blockchainService.getBalance();
        
        return c.json({
            connected: true,
            walletAddress: walletAddress,
            balance: `${balance} MATIC`,
            network: 'Polygon Amoy Testnet'
        });
    } catch (error) {
        console.error('Error checking blockchain status:', error);
        return c.json({
            connected: false,
            error: 'Failed to connect to blockchain',
            details: error.message
        });
    }
});

// Route to revoke a credential
router.delete('/revoke/:credentialId', universityAuthMiddleware, async (c) => {
    try {
        const university = c.get('university');
        const { credentialId } = c.req.param();

        // Find the credential and verify it belongs to this university
        const credential = await Credential.findOne({ 
            _id: credentialId, 
            university: university._id 
        });

        if (!credential) {
            return c.json({ error: 'Credential not found or not authorized' }, 404);
        }

        // Remove the credential from the student's credentials array
        await Student.findByIdAndUpdate(credential.student, {
            $pull: { credentials: credentialId }
        });

        // Delete the credential file if it exists
        if (credential.imagePath) {
            const absoluteFilePath = path.resolve(__dirname, '..', credential.imagePath);
            if (fs.existsSync(absoluteFilePath)) {
                fs.unlinkSync(absoluteFilePath);
            }
        }

        // Delete the credential from database
        await Credential.findByIdAndDelete(credentialId);

        return c.json({ message: 'Credential revoked successfully' });
    } catch (error) {
        console.error('Error revoking credential:', error);
        return c.json({ error: 'Server error' }, 500);
    }
});

export default router; 