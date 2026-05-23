import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import styles from './Case.module.css'; // Reusing your premium container styles!

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/logs');
        setLogs(res.data);
      } catch (error) {
        console.log("Failed to fetch logs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div className={styles.container}>Loading audit logs...</div>;

  return (
    <div className={styles.container} style={{ maxWidth: '1000px' }}>
      <h2 className={styles.heading}>System Audit Logs</h2>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        A secure record of system actions and modifications.
      </p>

      {logs.length === 0 ? (
        <p>No activity logged yet.</p>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#fff' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', color: '#475569' }}>Date & Time</th>
                <th style={{ padding: '1rem', color: '#475569' }}>User</th>
                <th style={{ padding: '1rem', color: '#475569' }}>Action</th>
                <th style={{ padding: '1rem', color: '#475569' }}>Case Affected</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: '#1e293b' }}>
                    {log.performedBy?.username} 
                    <span style={{ fontSize: '0.75rem', color: '#3b82f6', marginLeft: '5px' }}>
                      ({log.performedBy?.role})
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <strong>{log.action}</strong>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                      {log.details}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#1e3a8a', fontWeight: 'bold' }}>
                    {log.caseId ? `#${log.caseId.caseNumber}` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SystemLogs;