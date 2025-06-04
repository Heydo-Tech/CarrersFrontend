import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    resume: '',
    role: '',
    store: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [loadingUpload, setLoadingUpload] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setErrorMessage('');
    } else {
      setErrorMessage('Please upload a valid PDF file.');
    }
  };

  const handleUploadToCloudinary = async () => {
    if (!file) {
      setErrorMessage('No file selected');
      return null;
    }
    setLoadingUpload(true);
    try {
      const signatureResponse = await axios.post('http://carrers.apnimandi.us/generate-signature');
      const { signature, timestamp, api_key, cloud_name } = signatureResponse.data;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', api_key);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('upload_preset', 'apnimandi');

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/raw/upload`,
        formData
      );

      setFormData((prevState) => ({
        ...prevState,
        resume: response.data.secure_url,
      }));

      setFile(null);
      setErrorMessage('');
      return response.data.secure_url;
    } catch (error) {
      setErrorMessage('Error uploading PDF to Cloudinary');
      console.error(error);
      return null;
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (file) {
      const resumeUrl = await handleUploadToCloudinary();
      formData.resume = resumeUrl;
      if (!resumeUrl) {
        setErrorMessage('Failed to upload resume. Please try again.');
        return;
      }
    }

    try {
      await axios.post('http://carrers.apnimandi.us/submit-application', formData);
      alert('Application submitted successfully!');
      setFormData({
        name: '',
        email: '',
        contactNumber: '',
        resume: '',
        role: '',
        store: '',
      });
    } catch (error) {
      console.error('Error submitting application:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 mt-4 mb-4">
        <div className="flex justify-center mb-6">
          <img
            src="/favicon.png"
            alt="Logo"
            className="h-16 w-auto"
          />
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Career Portal</h1>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-600 focus:border-green-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-600 focus:border-green-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
            <input
              type="text"
              name="contactNumber"
              placeholder="Contact Number"
              value={formData.contactNumber}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-600 focus:border-green-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700"> (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-green-500 file:text-white hover:file:bg-green-600"
            />
          </div>
          {errorMessage && <p className="text-red-500 text-sm text-center">{errorMessage}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <input
              type="text"
              name="role"
              placeholder="Role"
              value={formData.role}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-600 focus:border-green-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Store</label>
            <select
              name="store"
              value={formData.store}
              onChange={handleChange}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-600 focus:border-green-600"
            >
              <option value="">Select Store</option>
              <option value="Fremont">Fremont</option>
              <option value="Milpitas">Milpitas</option>
              <option value="Karthik">Karthik</option>
              <option value="WareHouse">WareHouse</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loadingUpload}
            className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loadingUpload ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;