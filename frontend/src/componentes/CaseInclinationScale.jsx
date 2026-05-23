import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const CaseInclinationScale = ({ caseId, userRole }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isAuthorized = ['admin', 'clerk', 'judge', 'lawyer'].includes(userRole);

    const fetchInclination = async () => {
        if (!isAuthorized) return;
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/ai/case-inclination/${caseId}`);
            setData(res.data.data);
        } catch (err) {
            console.error("Error fetching case inclination", err);
            setError(err.response?.data?.message || 'Failed to analyze case inclination.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (caseId) {
            fetchInclination();
        }
    }, [caseId]);

    if (!isAuthorized) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px' }}>
                You are not authorized to view the Case Inclination for this case.
            </div>
        );
    }

    // Determine badge colors based on inclination
    const getBadgeStyle = (inclination) => {
        if (!inclination) return { bg: '#f1f5f9', color: '#64748b' }; // Neutral default
        if (inclination.includes('Prosecution')) return { bg: '#dbeafe', color: '#1e40af' }; // Blue
        if (inclination.includes('Defense')) return { bg: '#fee2e2', color: '#b91c1c' }; // Red
        return { bg: '#fef3c7', color: '#b45309' }; // Gold/Yellow for Neutral
    };

    const getConfidenceStyle = (confidence) => {
        if (confidence === 'High') return { bg: '#dcfce7', color: '#166534' }; // Green
        if (confidence === 'Medium') return { bg: '#fef3c7', color: '#b45309' }; // Gold
        return { bg: '#f1f5f9', color: '#64748b' }; // Gray
    };

    // Calculate rotation angle (max 30 degrees tilt)
    // If Prosecution is 100, Defense is 0. Diff = 0 - 100 = -100. Rotate = -30deg (Left goes down).
    const prosecutionScore = data?.prosecutionScore || 50;
    const defenseScore = data?.defenseScore || 50;
    const diff = defenseScore - prosecutionScore;
    const tiltAngle = (diff / 100) * 30; // degrees

    return (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            
            {/* Header */}
            <div style={{ padding: '1.5rem', backgroundColor: '#1e293b', color: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                    ⚖️ Case Inclination Analysis
                </h3>
                <button 
                    onClick={fetchInclination} 
                    disabled={loading}
                    style={{ 
                        padding: '0.5rem 1rem', backgroundColor: '#fbbf24', color: '#1e293b', border: 'none', borderRadius: '6px', 
                        cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Analyzing...' : '🔄 Refresh Analysis'}
                </button>
            </div>

            {/* Content */}
            <div style={{ padding: '2rem' }}>
                {error && (
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px' }}>
                        {error}
                    </div>
                )}

                {loading && !data && (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
                        <div className="dot-pulse" style={{ margin: '0 auto 1rem auto' }}></div>
                        <p>Our AI is thoroughly analyzing the case records...</p>
                    </div>
                )}

                {!loading && !data && !error && (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
                        <p>No analysis available yet. Click 'Refresh Analysis' to generate one.</p>
                    </div>
                )}

                {data && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* Summary Badges */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ 
                                padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: 'bold',
                                backgroundColor: getBadgeStyle(data.inclination).bg, color: getBadgeStyle(data.inclination).color
                            }}>
                                Status: {data.inclination}
                            </div>
                            <div style={{ 
                                padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: 'bold',
                                backgroundColor: getConfidenceStyle(data.confidence).bg, color: getConfidenceStyle(data.confidence).color
                            }}>
                                Confidence: {data.confidence}
                            </div>
                        </div>

                        {/* Animated Scale UI */}
                        <div style={{ position: 'relative', height: '250px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: '2rem' }}>
                            
                            {/* Base Pillar */}
                            <div style={{ position: 'absolute', bottom: '0', width: '20px', height: '180px', backgroundColor: '#475569', borderRadius: '4px 4px 0 0', zIndex: 1 }}></div>
                            <div style={{ position: 'absolute', bottom: '0', width: '100px', height: '20px', backgroundColor: '#334155', borderRadius: '10px 10px 0 0', zIndex: 1 }}></div>

                            {/* Beam (Tilts) */}
                            <div style={{ 
                                position: 'absolute', bottom: '170px', width: '300px', height: '10px', backgroundColor: '#cbd5e1', 
                                borderRadius: '5px', zIndex: 2,
                                transform: `rotate(${tiltAngle}deg)`,
                                transformOrigin: 'center center',
                                transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}>
                                {/* Left Pan (Prosecution) */}
                                <div style={{ 
                                    position: 'absolute', left: '0', top: '10px', width: '60px', height: '60px',
                                    border: '2px solid #3b82f6', borderTop: 'none', borderRadius: '0 0 30px 30px',
                                    transform: `translateX(-50%) rotate(${-tiltAngle}deg)`, // Counter rotate to keep straight
                                    transformOrigin: 'top center',
                                    display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: '10px',
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}>
                                    <span style={{ fontWeight: 'bold', color: '#1e40af' }}>{prosecutionScore}%</span>
                                    {/* Strings */}
                                    <div style={{ position: 'absolute', left: '0', top: '-10px', width: '2px', height: '10px', backgroundColor: '#94a3b8' }}></div>
                                    <div style={{ position: 'absolute', right: '0', top: '-10px', width: '2px', height: '10px', backgroundColor: '#94a3b8' }}></div>
                                </div>

                                {/* Right Pan (Defense) */}
                                <div style={{ 
                                    position: 'absolute', right: '0', top: '10px', width: '60px', height: '60px',
                                    border: '2px solid #ef4444', borderTop: 'none', borderRadius: '0 0 30px 30px',
                                    transform: `translateX(50%) rotate(${-tiltAngle}deg)`, // Counter rotate to keep straight
                                    transformOrigin: 'top center',
                                    display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: '10px',
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}>
                                    <span style={{ fontWeight: 'bold', color: '#b91c1c' }}>{defenseScore}%</span>
                                    {/* Strings */}
                                    <div style={{ position: 'absolute', left: '0', top: '-10px', width: '2px', height: '10px', backgroundColor: '#94a3b8' }}></div>
                                    <div style={{ position: 'absolute', right: '0', top: '-10px', width: '2px', height: '10px', backgroundColor: '#94a3b8' }}></div>
                                </div>
                            </div>
                            
                            {/* Fulcrum Dot */}
                            <div style={{ position: 'absolute', bottom: '167px', width: '16px', height: '16px', backgroundColor: '#fbbf24', borderRadius: '50%', zIndex: 3 }}></div>
                        </div>

                        {/* Labels for the Scale */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e40af' }}>Victim / Prosecution</h4>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Support: {prosecutionScore}%</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: '#b91c1c' }}>Accused / Defense</h4>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Support: {defenseScore}%</p>
                            </div>
                        </div>

                        {/* Divider */}
                        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0' }} />

                        {/* Reasons */}
                        <div>
                            <h4 style={{ color: '#1e293b', marginBottom: '1rem' }}>Key Observations Driving This Inclination:</h4>
                            {data.reasons && data.reasons.length > 0 ? (
                                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {data.reasons.map((reason, idx) => (
                                        <li key={idx} style={{ lineHeight: '1.5' }}>{reason}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p style={{ color: '#64748b', fontStyle: 'italic' }}>No specific reasons provided by the analysis.</p>
                            )}
                        </div>

                    </div>
                )}
            </div>

            {/* Disclaimer Footer */}
            <div style={{ padding: '1rem', backgroundColor: '#fef2f2', borderTop: '1px solid #fee2e2', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#991b1b', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <span>⚠️</span> {data?.disclaimer || "This case inclination is system-generated from available case records only. It is not a legal decision or judgment."}
                </p>
            </div>
        </div>
    );
};

export default CaseInclinationScale;
