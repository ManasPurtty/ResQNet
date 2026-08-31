import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

let isMongoConnected = false;

// In-memory user fallback storage when MongoDB is not active locally
export const inMemoryUsers = [
  {
    _id: 'usr_admin_001',
    name: 'Odisha State EOC Commander',
    email: 'admin@resqnet.gov.in',
    phone: '+91 94370 10100',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'ADMIN',
    district: 'Khordha',
    badgeNumber: 'OSDMA-EOC-01',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'usr_collector_001',
    name: 'District Collector Sundargarh',
    email: 'collector.sundargarh@odisha.gov.in',
    phone: '+91 94376 10200',
    passwordHash: bcrypt.hashSync('rourkela123', 10),
    role: 'ADMIN',
    district: 'Sundargarh',
    badgeNumber: 'DM-SNG-01',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'usr_citizen_001',
    name: 'Subrat Mohapatra',
    email: 'citizen@resqnet.demo',
    phone: '+91 94370 12345',
    passwordHash: bcrypt.hashSync('citizen123', 10),
    role: 'CITIZEN',
    district: 'Khordha',
    createdAt: new Date().toISOString()
  }
];

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resqnet';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500 // Quick timeout to fallback seamlessly if no local mongo daemon
    });

    isMongoConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    isMongoConnected = false;
    console.log(`ℹ️ MongoDB local instance not reachable (${error.message}).`);
    console.log(`⚡ Operating with high-speed in-memory authentication mode (Seeded Admins & Citizens active).`);
    return null;
  }
};

export const getDbStatus = () => isMongoConnected;
