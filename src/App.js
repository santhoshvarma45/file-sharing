import React, { useState } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert('Please select a file');
    setUploading(true);

    try {
      const res = await fetch(
        `https://f3sio4zofd.execute-api.us-east-1.amazonaws.com/dev/upload-url?filename=${file.name}`
      );
      const data = await res.json();
      const uploadURL = data.uploadURL;

      const uploadRes = await fetch(uploadURL, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (!uploadRes.ok) throw new Error('Upload failed');

      const newFile = {
        name: file.name,
        comment: '',
        url: uploadURL.split('?')[0],
      };

      setUploadedFiles([...uploadedFiles, newFile]);
      setFile(null);
      document.getElementById('fileInput').value = '';
      alert('✅ Upload successful!');
    } catch (err) {
      console.error(err);
      alert('❌ Upload failed. Check console for errors.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="App">
      <h1>📁 File Sharing & Collaboration</h1>

      <div className="upload-section">
        <input id="fileInput" type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      <div className="file-list">
        <h2>📂 Uploaded Files</h2>
        {uploadedFiles.length === 0 ? (
          <p>No files uploaded yet.</p>
        ) : (
          uploadedFiles.map((f, i) => (
            <div key={i} className="file-item">
              <a href={f.url} target="_blank" rel="noopener noreferrer">
                {f.name}
              </a>

              {/* Optional image preview */}
              {f.url.match(/\.(jpg|jpeg|png|gif)$/i) && (
                <div>
                  <img src={f.url} alt={f.name} width="100" />
                </div>
              )}

              <p>💬 Comment: {f.comment || 'No comment yet'}</p>
              <input
                type="text"
                placeholder="Add a comment"
                value={f.comment}
                onChange={(e) => {
                  const updatedFiles = [...uploadedFiles];
                  updatedFiles[i].comment = e.target.value;
                  setUploadedFiles(updatedFiles);
                }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
