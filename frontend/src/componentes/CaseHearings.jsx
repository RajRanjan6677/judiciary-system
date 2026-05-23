import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import styles from './Hearing.module.css';

const CaseHearings = ({ caseId, userRole }) => {
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the new hearing form
  const [formData, setFormData] = useState({
    date: '',
    remarks: '',
    nextHearingDate: '',
    sendNotification: true
  });
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch existing hearings
  const fetchHearings = async () => {
    try {
      const res = await api.get(`/hearing/${caseId}`);
      setHearings(res.data);
    } catch (error) {
      console.log("Failed to fetch hearings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (caseId) fetchHearings();
  }, [caseId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleAddHearing = async (e) => {
    e.preventDefault();
    try {
      await api.post('/hearing', { ...formData, caseId });
      setSuccessMsg(`Hearing added successfully! ${formData.sendNotification ? "Email Notification Sent." : ""}`);
      // Reset form
      setFormData({ date: '', remarks: '', nextHearingDate: '', sendNotification: true });
      // Refresh the hearing list so the new one shows up instantly
      fetchHearings();
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add hearing");
    }
  };

  if (loading) return <div>Loading hearings...</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Case Hearings</h2>
      {successMsg && <div className={styles.successMessage} style={{ backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{successMsg}</div>}

      {/* Only show the Add form to Admins and Clerks */}
      {(userRole === 'admin' || userRole === 'clerk') && (
        <form className={styles.form} onSubmit={handleAddHearing}>
          <h3 style={{ marginTop: 0 }}>Add New Hearing</h3>
          
          <label className={styles.inputGroup}>Hearing Date:
            <input className={styles.input} type="date" name="date" value={formData.date} onChange={handleChange} required />
          </label>
          
          <label className={styles.inputGroup}>Remarks/Notes:
            <textarea className={styles.textarea} name="remarks" value={formData.remarks} onChange={handleChange} required />
          </label>
          
          <label className={styles.inputGroup}>Next Hearing Date (Optional):
            <input className={styles.input} type="date" name="nextHearingDate" value={formData.nextHearingDate} onChange={handleChange} />
          </label>

          <label className={styles.checkboxGroup} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
            <input type="checkbox" name="sendNotification" checked={formData.sendNotification} onChange={handleChange} />
            Send Email Notification to Assigned Lawyer & Judge
          </label>

          <button type="submit" className={styles.submitBtn}>Save Hearing</button>
        </form>
      )}

      {/* Display the list of hearings */}
      <div>
        {hearings.length === 0 ? (
          <p>No hearings recorded for this case yet.</p>
        ) : (
          hearings.map((hearing) => (
            <div key={hearing._id} className={styles.hearingCard}>
              <div className={styles.hearingDate}>
                Date: {new Date(hearing.date).toLocaleDateString()}
              </div>
              <p><strong>Remarks:</strong> {hearing.remarks}</p>
              {hearing.nextHearingDate && (
                <p><strong>Next Hearing:</strong> {new Date(hearing.nextHearingDate).toLocaleDateString()}</p>
              )}
              <small>Recorded by: {hearing.createdBy?.username} ({hearing.createdBy?.role})</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CaseHearings;