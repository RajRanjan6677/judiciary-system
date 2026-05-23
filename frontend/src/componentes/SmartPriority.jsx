import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import styles from './Case.module.css';

const SmartPriority = () => {
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPriority, setFilterPriority] = useState('All');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const authRes = await api.get('/auth/check');
                setUserRole(authRes.data.role);

                const res = await api.get('/analytics/pending-priority');
                setAnalytics(res.data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
                alert("Failed to load priority analytics.");
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const handleAssignDate = async (caseId, date) => {
        if (!window.confirm(`Are you sure you want to officially schedule a hearing for ${new Date(date).toLocaleDateString()}?`)) {
            return;
        }

        try {
            await api.put(`/analytics/cases/${caseId}/assign-next-date`, { nextHearingDate: date });
            alert("Hearing successfully scheduled!");
            
            // Refresh list
            const res = await api.get('/analytics/pending-priority');
            setAnalytics(res.data);
        } catch (error) {
            console.error("Failed to assign date", error);
            alert("Failed to assign hearing date.");
        }
    };

    const getPriorityBadge = (priority) => {
        const style = {
            padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-block'
        };
        if (priority === 'High') return <span style={{ ...style, backgroundColor: '#fee2e2', color: '#b91c1c' }}>High Priority</span>;
        if (priority === 'Medium') return <span style={{ ...style, backgroundColor: '#fef3c7', color: '#b45309' }}>Medium Priority</span>;
        return <span style={{ ...style, backgroundColor: '#dcfce7', color: '#15803d' }}>Low Priority</span>;
    };

    const getComplexityBadge = (complexity) => {
        if (complexity === 'Complex') {
            return <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: '#f3e8ff', color: '#7e22ce', marginLeft: '5px' }}>Complex</span>;
        }
        return null;
    };

    const filteredAnalytics = analytics.filter(c => {
        const matchesSearch = c.caseNumber.toString().includes(searchQuery) || c.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPriority = filterPriority === 'All' || c.priority === filterPriority;
        return matchesSearch && matchesPriority;
    });

    if (loading) return <div className={styles.container}>Loading AI Smart Priority Data...</div>;

    return (
        <div className={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className={styles.heading} style={{ margin: 0 }}>Smart Pending Case Priority</h2>
            </div>
            
            <div style={{ backgroundColor: '#fffbeb', color: '#b45309', padding: '12px 16px', borderRadius: '8px', border: '1px solid #fde68a', marginBottom: '20px', fontSize: '0.9rem' }}>
                <strong>Note:</strong> This priority score is system-generated for administrative scheduling support only. Final scheduling decisions remain with authorized court officials.
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="Search case number or title..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.input}
                    style={{ flex: 1, margin: 0 }}
                />
                <select 
                    value={filterPriority} 
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className={styles.select}
                    style={{ width: '200px', margin: 0 }}
                >
                    <option value="All">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
            </div>

            {filteredAnalytics.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
                    No pending cases found matching your criteria.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {filteredAnalytics.map((item) => (
                        <div key={item.caseId} style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                            
                            <div style={{ flex: '1 1 300px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                    <h3 style={{ margin: 0, color: '#1e293b' }}>Case #{item.caseNumber}</h3>
                                    {getPriorityBadge(item.priority)}
                                    {getComplexityBadge(item.complexity)}
                                    <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Score: {item.urgencyScore}</span>
                                </div>
                                <h4 style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '1.1rem' }}>{item.title}</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', fontSize: '0.9rem', color: '#64748b', marginBottom: '10px' }}>
                                    <span><strong>Category:</strong> {item.caseCategory}</span>
                                    <span><strong>Pending for:</strong> {item.caseAgeDays} days</span>
                                    <span><strong>Hearings:</strong> {item.completedHearings}</span>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#dc2626' }}>
                                    <strong>Priority Reason:</strong> {item.reason}
                                </div>
                            </div>

                            <div style={{ flex: '0 0 250px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                <div style={{ marginBottom: '10px', fontSize: '0.9rem' }}>
                                    <strong style={{ color: '#475569' }}>Current Next Hearing:</strong><br/>
                                    <span style={{ color: item.currentNextHearingDate ? '#1e293b' : '#dc2626' }}>
                                        {item.currentNextHearingDate ? new Date(item.currentNextHearingDate).toLocaleDateString() : "Not Scheduled"}
                                    </span>
                                </div>
                                
                                <div style={{ marginBottom: '15px', fontSize: '0.9rem' }}>
                                    <strong style={{ color: '#475569' }}>Suggested Next Hearing:</strong><br/>
                                    <span style={{ color: '#047857', fontWeight: 'bold' }}>
                                        {new Date(item.suggestedNextHearingDate).toLocaleDateString()}
                                    </span>
                                </div>

                                {(userRole === 'admin' || userRole === 'clerk' || userRole === 'judge') && (
                                    <button 
                                        onClick={() => handleAssignDate(item.caseId, item.suggestedNextHearingDate)}
                                        style={{ width: '100%', padding: '8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s' }}
                                        onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                                        onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                                    >
                                        Approve & Assign Date
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SmartPriority;
