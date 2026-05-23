import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import styles from './Case.module.css';

const CaseChatbot = ({ caseId, userRole }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);

    const isAuthorized = ['admin', 'clerk', 'judge', 'lawyer'].includes(userRole);

    useEffect(() => {
        if (isAuthorized && caseId) {
            fetchChatHistory();
        }
    }, [caseId, isAuthorized]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchChatHistory = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/ai/chatbot/${caseId}`);
            setMessages(res.data);
            setError('');
        } catch (err) {
            console.error("Error fetching chat history", err);
            setError('Failed to load chat history.');
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !isAuthorized) return;
        if (input.length > 500) {
            setError('Question cannot exceed 500 characters.');
            return;
        }

        const userMessage = { role: 'user', message: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setError('');

        try {
            const res = await api.post(`/ai/chatbot/${caseId}`, { question: userMessage.message });
            const aiMessage = { role: 'ai', message: res.data.answer };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (err) {
            console.error("Error sending question", err);
            setError(err.response?.data?.message || 'Failed to get an answer from the AI.');
        } finally {
            setLoading(false);
        }
    };

    const handleClearChat = async () => {
        if (!window.confirm("Are you sure you want to clear the chat history?")) return;
        try {
            await api.delete(`/ai/chatbot/${caseId}`);
            setMessages([]);
            setError('');
        } catch (err) {
            console.error("Error clearing chat history", err);
            setError('Failed to clear chat history.');
        }
    };

    if (!isAuthorized) {
        return (
            <div className={styles.container}>
                <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px' }}>
                    You are not authorized to use the AI Chatbot for this case.
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '600px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '1rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🤖 AI Case Chatbot
                </h3>
                {messages.length > 0 && (
                    <button 
                        onClick={handleClearChat}
                        style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}
                    >
                        Clear Chat
                    </button>
                )}
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', backgroundColor: '#f1f5f9', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', color: '#64748b', marginTop: 'auto', marginBottom: 'auto' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                        <p style={{ margin: 0 }}>Ask questions about this case's history, documents, or status.</p>
                        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Example: "What happened in the last hearing?"</p>
                    </div>
                )}
                
                {messages.map((msg, index) => (
                    <div key={index} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        padding: '1rem',
                        borderRadius: '12px',
                        backgroundColor: msg.role === 'user' ? '#2563eb' : '#ffffff',
                        color: msg.role === 'user' ? '#ffffff' : '#1e293b',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        borderBottomRightRadius: msg.role === 'user' ? '0' : '12px',
                        borderBottomLeftRadius: msg.role === 'ai' ? '0' : '12px',
                    }}>
                        {/* If AI message, render simple formatting */}
                        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.5' }}>
                            {msg.message}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div style={{ alignSelf: 'flex-start', padding: '1rem', borderRadius: '12px', backgroundColor: '#ffffff', color: '#64748b', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderBottomLeftRadius: '0' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <div className="dot-pulse">AI is thinking...</div>
                        </div>
                    </div>
                )}
                
                {error && (
                    <div style={{ alignSelf: 'center', padding: '0.75rem 1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Note */}
            <div style={{ padding: '0.5rem 1rem', backgroundColor: '#f8fafc', fontSize: '0.75rem', color: '#64748b', textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
                Note: AI answers are generated from available case records only and should be verified by authorized court officials.
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} style={{ padding: '1rem', backgroundColor: '#ffffff', display: 'flex', gap: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about this case..."
                    disabled={loading}
                    style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }}
                />
                <button 
                    type="submit" 
                    disabled={loading || !input.trim()}
                    style={{ padding: '0.75rem 1.5rem', backgroundColor: loading || !input.trim() ? '#94a3b8' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default CaseChatbot;
