import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

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
      return null; // Return null if no file is selected
    }
    setLoadingUpload(true);
    try {
      const signatureResponse = await axios.post('https://careers.apnimandi.us/api/generate-signature');
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

      // Update the formData state with the Cloudinary URL
      setFormData((prevState) => ({
        ...prevState,
        resume: response.data.secure_url,
      }));

      setFile(null);
      setErrorMessage('');
      return response.data.secure_url; // Return the uploaded URL
    } catch (error) {
      setErrorMessage('Error uploading PDF to Cloudinary');
      console.error(error);
      return null; // Return null if upload fails
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Upload the file to Cloudinary if a file is selected
    if (file) {
      const resumeUrl = await handleUploadToCloudinary();
      formData.resume=resumeUrl
      console.log(resumeUrl);
      if (!resumeUrl) {
        setErrorMessage('Failed to upload resume. Please try again.');
        return; // Stop submission if upload fails
      }
    }

    try {
      await axios.post('https://careers.apnimandi.us/api/submit-application', formData);
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
    <div className="App">
      <h1>Career Portal</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="contactNumber"
          placeholder="Contact Number"
          value={formData.contactNumber}
          onChange={handleChange}
          required
        />
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="input-file"
        />
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <input
          type="text"
          name="role"
          placeholder="Role"
          value={formData.role}
          onChange={handleChange}
          required
        />
        <select
          name="store"
          value={formData.store}
          onChange={handleChange}
          required
        >
          <option value="">Select Store</option>
          <option value="Fremont">Fremont</option>
          <option value="Milpitas">Milpitas</option>
          <option value="Karthik">Karthik</option>
          <option value="WareHouse">WareHouse</option>
        </select>
        <button type="submit" disabled={loadingUpload}>
          {loadingUpload ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

export default App;