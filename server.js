import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { JSONFilePreset } from 'lowdb/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// --- Configuration ---
const PORT = 3000;
const SECRET_KEY = 'deeptrust-secret-key-change-me'; // In production, use environment variable
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Database Setup (LowDB) ---
const defaultData = { users: [], analyses: [] };
const db = await JSONFilePreset('db.json', defaultData);

// Helper to find user
const findUserByUsername = (username) => db.data.users.find(u => u.username === username);
const findUserById = (id) => db.data.users.find(u => u.id === id);

// Initialize Admin User if not exists
if (!findUserByUsername('admin')) {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  db.data.users.push({
    id: '1',
    username: 'admin',
    password: hashedPassword,
    role: 'admin',
    createdAt: new Date().toISOString()
  });
  await db.write();
  console.log("Admin user created: admin / admin123");
}



// --- Express App Setup ---
const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// --- Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// --- Routes: Auth ---

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Missing credentials" });

  if (findUserByUsername(username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now().toString(),
    username,
    password: hashedPassword,
    role: 'user', // Default role
    createdAt: new Date().toISOString()
  };

  db.data.users.push(newUser);
  await db.write();

  res.status(201).json({ message: "User registered successfully" });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = findUserByUsername(username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// --- Routes: Data/History ---

// Save analysis result
app.post('/api/history', authenticateToken, async (req, res) => {
  const { type, result, fileName } = req.body;
  
  const entry = {
    id: Date.now().toString(),
    userId: req.user.id,
    type, // 'deepfake', 'finance', 'ocr'
    fileName,
    result,
    timestamp: new Date().toISOString()
  };

  db.data.analyses.unshift(entry); // Add to beginning
  await db.write();

  res.status(201).json(entry);
});

// Get user history
app.get('/api/history', authenticateToken, (req, res) => {
  const userHistory = db.data.analyses.filter(a => a.userId === req.user.id);
  res.json(userHistory);
});

// Get Dashboard Stats
app.get('/api/stats', authenticateToken, (req, res) => {
  const isAdmin = req.user.role === 'admin';
  // Admin sees all, User sees theirs
  const relevantAnalyses = isAdmin 
    ? db.data.analyses 
    : db.data.analyses.filter(a => a.userId === req.user.id);

  const stats = {
    totalAnalyses: relevantAnalyses.length,
    deepfakeCount: relevantAnalyses.filter(a => a.type === 'deepfake' || a.type === 'image' || a.type === 'video' || a.type === 'audio').length,
    financeCount: relevantAnalyses.filter(a => a.type === 'finance').length,
    highRiskCount: relevantAnalyses.filter(a => a.result?.riskLevel === 'high' || (a.result?.score > 70)).length,
    recentActivity: relevantAnalyses.slice(0, 5) // Last 5
  };

  if (isAdmin) {
    stats.totalUsers = db.data.users.length;
    stats.activeUsers = db.data.users.filter(u => u.status === 'active').length;
    stats.totalTokens = relevantAnalyses.reduce((acc, curr) => {
      if (["audio", "video", "image"].includes(curr.type)) return acc + 50;
      if (curr.type === "finance") return acc + 30;
      return acc + 10;
    }, 0);
  }

  res.json(stats);
});

// --- Routes: User Management (Admin Only) ---

app.get('/api/users', authenticateToken, requireAdmin, (req, res) => {
  // Return users without passwords, enriched with usage stats
  const usersWithStats = db.data.users.map(({ password, ...u }) => {
    const userAnalyses = db.data.analyses.filter(a => a.userId === u.id);
    const requests = userAnalyses.length;
    
    // Calculate tokens based on analysis type (mirroring frontend logic)
    const tokens = userAnalyses.reduce((acc, curr) => {
      if (["audio", "video", "image"].includes(curr.type)) return acc + 50;
      if (curr.type === "finance") return acc + 30;
      return acc + 10;
    }, 0);

    // Determine last active
    const lastActive = userAnalyses.length > 0 
      ? userAnalyses[0].timestamp // Analyses are unshifted (newest first)
      : u.createdAt;

    return {
      ...u,
      requests,
      tokens,
      lastActive,
      apiKey: u.role === 'admin' ? "Custom (Gemini)" : "System Default" // Mock API key status for now
    };
  });
  
  res.json(usersWithStats);
});

app.post('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  const { username, password, role, email } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Missing credentials" });

  if (findUserByUsername(username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now().toString(),
    username,
    password: hashedPassword,
    role: role || 'user',
    email: email || '',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  db.data.users.push(newUser);
  await db.write();

  const { password: _, ...userSafe } = newUser;
  res.status(201).json(userSafe);
});

app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  if (id === '1') return res.status(403).json({ message: "Cannot delete default admin" }); // Protect main admin
  
  const initialLength = db.data.users.length;
  db.data.users = db.data.users.filter(u => u.id !== id);
  
  if (db.data.users.length === initialLength) {
    return res.status(404).json({ message: "User not found" });
  }
  
  await db.write();
  res.json({ message: "User deleted" });
});

// --- Mock Logic Functions (kept for fallback) ---
const getMockDeepfakeResult = (type) => {
  const baseResult = {
    score: Math.floor(Math.random() * 100),
    riskLevel: "low",
    signals: [],
  };
  if (baseResult.score < 30) baseResult.riskLevel = "low";
  else if (baseResult.score < 70) baseResult.riskLevel = "medium";
  else baseResult.riskLevel = "high";

  if (type === "image") {
    baseResult.signals = [
      { type: "face_manipulation", confidence: 0.85, description: "Artifacts détectés autour des contours du visage" },
      { type: "lighting_inconsistency", confidence: 0.72, description: "Incohérence d'éclairage entre le visage et l'arrière-plan" },
      { type: "eye_reflection", confidence: 0.68, description: "Réflexions oculaires anormales" }
    ];
  } else if (type === "video") {
    baseResult.signals = [
      { type: "temporal_inconsistency", confidence: 0.91, description: "Incohérences temporelles entre les frames" },
      { type: "lip_sync", confidence: 0.78, description: "Désynchronisation lèvres/audio" },
      { type: "blink_pattern", confidence: 0.65, description: "Pattern de clignement anormal" }
    ];
    baseResult.metadata = {
      duration: 15.5,
      fps: 30,
      codec: "H.264",
    };
  } else {
    baseResult.signals = [
      { type: "voice_spoofing", confidence: 0.88, description: "Signaux de synthèse vocale détectés" },
      { type: "spectral_anomaly", confidence: 0.74, description: "Anomalies spectrales dans les hautes fréquences" },
      { type: "breathing_pattern", confidence: 0.59, description: "Pattern respiratoire irrégulier" }
    ];
  }
  return baseResult;
};

const getMockFinanceResult = () => ({
  documentType: "invoice",
  fields: [{ name: "Total", value: "1000€", confidence: 0.99 }],
  redFlags: [],
  compliance: { kyc: true, signature: true, stamp: false }
});

// --- Routes: Analysis (Deepfake/Finance/OCR) ---
// These routes now simulate processing AND can save if client requests, 
// but typically client calls /api/history after getting result.
// For the "Mock API" part, we just return the result.

app.post('/api/deepfake/:type', upload.single('file'), (req, res) => {
  const { type } = req.params;
  const result = getMockDeepfakeResult(type);
  setTimeout(() => res.json(result), 1000);
});

app.post('/api/finance', upload.single('file'), (req, res) => {
  const result = getMockFinanceResult();
  setTimeout(() => res.json(result), 1000);
});

app.post('/api/ocr', upload.single('file'), (req, res) => {
  const result = getMockFinanceResult();
  setTimeout(() => res.json(result), 1000);
});

// Health check
app.get('/api/deepfake/health', (req, res) => res.sendStatus(200));
app.get('/api/finance/health', (req, res) => res.sendStatus(200));
app.get('/api/ocr/health', (req, res) => res.sendStatus(200));

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
  console.log(`Database initialized in ${path.join(__dirname, 'db.json')}`);
});
