import mongoose from 'mongoose';
import dns from 'dns';

// Set DNS servers first - use well-known public DNS
dns.setServers(['1.1.1.1', '8.8.8.8']);

const connectDB = async () => {
  try {
    // Connection options with comprehensive settings
    const mongooseOptions = {
      // Connection timeouts
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      
      // Retry settings
      retryWrites: true,
      retryReads: true,
      w: 'majority',
      
      // Pool settings
      maxPoolSize: 10,
      minPoolSize: 2,
      
      // DNS resolution
      family: 4, // Use IPv4
      
      // Journal writes
      journal: true
    };

    console.log('Connecting to MongoDB...');
    console.log('URI:', process.env.MONGODB_URI?.replace(/:[^:]*@/, ':****@'));
    
    await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);

    console.log('✓ MongoDB Connected Successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('✗ MongoDB Connection Failed');
    console.error('Error:', error.message);
    
    // Helpful debugging information
    if (error.message.includes('ETIMEOUT') || error.message.includes('ENOTFOUND')) {
      console.error('\nTroubleshooting:');
      console.error('1. Check your internet connection');
      console.error('2. Ensure MongoDB Atlas IP whitelist includes your current IP');
      console.error('3. Verify credentials in .env file are correct');
      console.error('4. Check if you\'re behind a firewall/proxy blocking DNS');
      console.error('5. Try using VPN if connection still fails');
    }
    
    process.exit(1);
  }
};

export default connectDB;
