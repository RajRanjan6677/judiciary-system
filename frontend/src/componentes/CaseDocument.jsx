import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import styles from './Hearing.module.css'; // Reusing the hearing styles for consistency!

const CaseDocuments = ({ caseId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the upload form
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch existing documents
  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/documents/${caseId}`);
      setDocuments(res.data);
    } catch (error) {
      console.log("Failed to fetch documents", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (caseId) fetchDocuments();
  }, [caseId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Grabs the actual file object
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return alert("Please provide a title and select a file.");

    setUploading(true);

    // Because we are sending a file, we MUST use FormData instead of a standard JSON object
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file); // "file" must match the name in upload.single("file") on the backend

    try {
      await api.post(`/documents/${caseId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Tells the backend to expect a file
        },
      });
      
      alert("Document uploaded successfully!");
      setTitle('');
      setFile(null);
      // Reset the file input visually
      e.target.reset(); 
      fetchDocuments(); // Refresh the list
    } catch (error) {
      alert(error.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Loading documents...</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Case Documents</h2>

      {/* Upload Form */}
      <form className={styles.form} onSubmit={handleUpload}>
        <h3 style={{ marginTop: 0 }}>Upload New Document</h3>
        
        <label className={styles.inputGroup}>Document Title:
          <input 
            className={styles.input} 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g., Witness Statement, Court Order..."
            required 
          />
        </label>
        
        <label className={styles.inputGroup}>Select File:
          <input 
            className={styles.input} 
            type="file" 
            onChange={handleFileChange} 
            accept=".pdf,.doc,.docx,.jpg,.png" // Restrict file types if you want
            required 
          />
        </label>

        <button type="submit" className={styles.submitBtn} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Document"}
        </button>
      </form>

      {/* Document List */}
      <div>
        {documents.length === 0 ? (
          <p>No documents uploaded for this case yet.</p>
        ) : (
          documents.map((doc) => (
            <div key={doc._id} className={styles.hearingCard}>
              <div className={styles.hearingDate}>
                {doc.title}
              </div>
              <p>
                <small>Uploaded by: {doc.uploadedBy?.username} on {new Date(doc.createdAt).toLocaleDateString()}</small>
              </p>
              {/* Assuming your backend runs on localhost:5000. 
                  Update this URL if your backend is hosted elsewhere! */}
              <a 
                href={`http://localhost:3000${doc.fileUrl}`} 
                target="_blank" 
                rel="noreferrer"
                style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}
              >
                📄 View / Download Document
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CaseDocuments;