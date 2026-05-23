import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import styles from './Case.module.css'; // Reusing case styles for layout

const HearingList = () => {
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllHearings = async () => {
      try {
        const res = await api.get('/hearing');
        setHearings(res.data);
      } catch (error) {
        console.log("Failed to fetch schedule", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllHearings();
  }, []);

  if (loading) return <div className={styles.container}>Loading schedule...</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Upcoming Hearing Schedule</h2>
      
      {hearings.length === 0 ? (
        <p>No hearings scheduled at this time.</p>
      ) : (
        hearings.map((hearing) => (
          <div key={hearing._id} className={styles.caseCard}>
            <div className={styles.caseHeader}>
              {/* Check if caseId exists in case it was deleted */}
              <h3>
                {new Date(hearing.date).toLocaleDateString()} - Case #{hearing.caseId?.caseNumber || "N/A"}
              </h3>
              <span className={styles.status}>{hearing.caseId?.status || "Unknown"}</span>
            </div>
            <p><strong>Title:</strong> {hearing.caseId?.title}</p>
            <p><strong>Judge:</strong> {hearing.caseId?.judgeId ? `Hon. ${hearing.caseId.judgeId.username}` : "Unassigned"}</p>
            <p><strong>Remarks:</strong> {hearing.remarks}</p>
            {hearing.nextHearingDate && (
              <p style={{ color: '#d9534f', fontWeight: 'bold' }}>
                Next Hearing: {new Date(hearing.nextHearingDate).toLocaleDateString()}
              </p>
            )}
            
            {/* Quick link to jump directly to that case's update page */}
            {hearing.caseId && (
               <button 
                 className={styles.submitBtn} 
                 style={{ marginTop: '10px' }}
                 onClick={() => navigate(`../case-update/${hearing.caseId._id}`)}
               >
                 View Case
               </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default HearingList;