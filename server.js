const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Cloudinary Configuration
cloudinary.config({
  cloud_name: 'dlxdc5k0d',
  api_key: '928955478688766',
  api_secret: 'Gm4AqtZ1zKwmMk9ydYqX_DR565A',
});

// MongoDB Connection
mongoose.connect('mongodb+srv://vishalaggarwal270:Nvy1HI7eJ2guvoEN@barcodeproject.d43bd.mongodb.net/carrers', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connect(){
    try{
// MongoDB Connection
await mongoose.connect('mongodb+srv://vishalaggarwal270:Nvy1HI7eJ2guvoEN@barcodeproject.d43bd.mongodb.net/carrers', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
console.log("Monodb Connected")  ;
    }catch(e){
console.log("MongoDb Not connected");
    }
}
connect();

// Mongoose Model
const CareerSchema = new mongoose.Schema({
  name: String,
  email: String,
  contactNumber: String,
  resume: String,
  role: String,
  store: String,
});

const Career = mongoose.model('Career', CareerSchema);

// Generate Cloudinary Signature
app.post('/generate-signature', (req, res) => {
  const paramsToSign = {
    timestamp: Math.floor(Date.now() / 1000),
    upload_preset: 'apnimandi',
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    cloudinary.config().api_secret
  );

  res.json({
    signature,
    timestamp: paramsToSign.timestamp,
    api_key: cloudinary.config().api_key,
    cloud_name: cloudinary.config().cloud_name,
  });
});

// Handle Form Submission
app.post('/submit-application', async (req, res) => {
  const { name, email, contactNumber, resume, role, store } = req.body;

  try {
    const newApplication = new Career({
      name,
      email,
      contactNumber,
      resume,
      role,
      store,
    });

    await newApplication.save();
    res.status(201).json({ message: 'Application submitted successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Error submitting application' });
  }
});

// Start Server
const PORT = process.env.PORT || 5009;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});