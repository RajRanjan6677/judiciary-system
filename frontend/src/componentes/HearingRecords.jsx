import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import styles from './Hearing.module.css'; // Reusing styles from hearing

const HearingRecords = ({ caseId, userRole }) => {
    const [hearings, setHearings] = useState([]);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [formData, setFormData] = useState({
        hearingId: '',
        recordText: ''
    });
    
    const [editingRecord, setEditingRecord] = useState(null);

    const fetchHearingsAndRecords = async () => {
        try {
            const [hearingsRes, recordsRes] = await Promise.all([
                api.get(`/hearing/${caseId}`),
                api.get(`/hearing-records/${caseId}`)
            ]);
            setHearings(hearingsRes.data);
            setRecords(recordsRes.data);
        } catch (error) {
            console.error("Failed to fetch data for hearing records", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (caseId) fetchHearingsAndRecords();
    }, [caseId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingRecord) {
                await api.put(`/hearing-records/${editingRecord._id}`, { recordText: formData.recordText });
                alert("Hearing record updated successfully!");
                setEditingRecord(null);
            } else {
                await api.post('/hearing-records', { ...formData, caseId });
                alert("Hearing record added successfully!");
            }
            setFormData({ hearingId: '', recordText: '' });
            fetchHearingsAndRecords();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to save hearing record");
        }
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        setFormData({ hearingId: record.hearingId, recordText: record.recordText });
    };

    if (loading) return <div>Loading hearing records...</div>;

    const availableHearings = hearings.filter(h => !records.some(r => r.hearingId === h._id) || (editingRecord && editingRecord.hearingId === h._id));

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>Hearing Records</h2>
            <p style={{ color: '#64748b', marginBottom: '1rem', fontStyle: 'italic' }}>
                Detailed chronological logs of proceedings and official outcomes.
            </p>

            {(userRole === 'admin' || userRole === 'clerk') && (
                <form className={styles.form} onSubmit={handleSave} style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginTop: 0 }}>{editingRecord ? "Update Hearing Record" : "Add New Hearing Record"}</h3>
                    
                    <label className={styles.inputGroup}>Select Hearing Date:
                        <select className={styles.select} name="hearingId" value={formData.hearingId} onChange={handleChange} required disabled={!!editingRecord}>
                            <option value="">-- Select Hearing --</option>
                            {availableHearings.map(h => (
                                <option key={h._id} value={h._id}>
                                    {new Date(h.date).toLocaleDateString()} - {h.remarks?.substring(0, 30)}...
                                </option>
                            ))}
                        </select>
                    </label>
                    
                    <label className={styles.inputGroup}>What happened today? (Official Record):
                        <textarea 
                            className={styles.textarea} 
                            name="recordText" 
                            value={formData.recordText} 
                            onChange={handleChange} 
                            placeholder="Enter the official hearing outcomes..."
                            required 
                            style={{ minHeight: '150px' }}
                        />
                    </label>
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" className={styles.submitBtn}>
                            {editingRecord ? "Update Record" : "Save Record"}
                        </button>
                        {editingRecord && (
                            <button type="button" onClick={() => { setEditingRecord(null); setFormData({ hearingId: '', recordText: '' }); }} className={styles.submitBtn} style={{ backgroundColor: '#94a3b8' }}>
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>
            )}

            <div>
                {records.length === 0 ? (
                    <p>No official records available for these hearings.</p>
                ) : (
                    records.map(record => (
                        <div key={record._id} className={styles.hearingCard} style={{ backgroundColor: '#fff', borderLeft: '4px solid #3b82f6' }}>
                            <div className={styles.hearingDate} style={{ color: '#1e293b' }}>
                                Hearing Date: {new Date(record.hearingDate).toLocaleDateString()}
                            </div>
                            <p style={{ whiteSpace: 'pre-wrap', color: '#334155' }}>{record.recordText}</p>
                            <small style={{ color: '#94a3b8', display: 'block', marginTop: '10px' }}>
                                Logged by: {record.recordedBy?.username} ({record.recordedBy?.role}) | 
                                Last Updated: {new Date(record.updatedAt).toLocaleDateString()}
                            </small>

                            {(userRole === 'admin' || userRole === 'clerk') && !editingRecord && (
                                <button 
                                    onClick={() => handleEdit(record)}
                                    style={{ marginTop: '10px', padding: '5px 15px', border: 'none', backgroundColor: '#e2e8f0', color: '#475569', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Edit Record
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HearingRecords;
