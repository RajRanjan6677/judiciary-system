
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import styles from './Case.module.css'; 
import CaseHearings from './CaseHearings';
import CaseDocuments from './CaseDocument';
import HearingRecords from './HearingRecords';
import AICaseSummary from './AICaseSummary';
import CaseChatbot from './CaseChatbot';
import CaseInclinationScale from './CaseInclinationScale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <-- Import it directly like this
const UpdateCase = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    summary: '', // <-- Added summary
    lawyerId: '',
    judgeId: '' // <-- Added judgeId to state
  });
  
  const [lawyers, setLawyers] = useState([]);
  const [judges, setJudges] = useState([]); // <-- Added state for judges
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // States for Summary
  const [caseHearings, setCaseHearings] = useState([]);
  const [caseDocuments, setCaseDocuments] = useState([]);
  const [caseCreatedAt, setCaseCreatedAt] = useState(null);
  
  // State for Tabs
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get the current user's role to determine permissions
        const authRes = await api.get('/auth/check');
        const role = authRes.data.role;
        setUserRole(role);

        // 2. Fetch case, hearings, and documents concurrently
        const [caseRes, hearingsRes, docsRes] = await Promise.all([
          api.get(`/cases/${id}`),
          api.get(`/hearing/${id}`),
          api.get(`/documents/${id}`)
        ]);

        const caseData = caseRes.data;
        
        setFormData({
          title: caseData.title,
          description: caseData.description,
          status: caseData.status,
          summary: caseData.summary || '', // <-- Extract summary
          // Extract _id if populated, otherwise use the raw ID or empty string
          lawyerId: caseData.lawyerId ? (caseData.lawyerId._id || caseData.lawyerId) : '',
          judgeId: caseData.judgeId ? (caseData.judgeId._id || caseData.judgeId) : '' // <-- Handle judgeId
        });

        setCaseHearings(hearingsRes.data);
        setCaseDocuments(docsRes.data);
        setCaseCreatedAt(caseData.createdAt);

        // 3. If Admin/Clerk, fetch BOTH lawyers and judges lists for the assignment dropdowns
        if (role === 'admin' || role === 'clerk') {
          const [lawyersRes, judgesRes] = await Promise.all([
            api.get('/auth/lawyers'),
            api.get('/auth/judges')
          ]);
          setLawyers(lawyersRes.data);
          setJudges(judgesRes.data);
        }
      } catch (error) {
        console.log("Error fetching data", error);
        alert("Failed to load case data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send null if IDs are empty strings so the backend unassigns them properly
      const dataToSend = { 
        ...formData, 
        lawyerId: formData.lawyerId || null,
        judgeId: formData.judgeId || null 
      };
      
      await api.put(`/cases/${id}`, dataToSend);
      
      alert('Case updated successfully!');
      navigate(-1); 
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update case");
    }
  };

  if (loading) return <div className={styles.container}>Loading case details...</div>;
  const generatePDF = async () => {
    // 1. Initialize the PDF document
    const doc = new jsPDF();

    // 2. Add a professional Header
    doc.setFontSize(22);
    doc.setTextColor(30, 58, 138); // Premium Navy Blue
    doc.text("Official Case Report", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    // 3. Draw a line separator
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 32, 196, 32);

    // 4. Create the Case Details Table
    const caseDetails = [
      ["Case Title", formData.title],
      ["Status", formData.status.toUpperCase()],
      ["Description", formData.description],
      // We check if the dropdowns have a selected value, and find the matching name from the lists
      ["Assigned Judge", judges.find(j => j._id === formData.judgeId)?.username || "Unassigned"],
      ["Assigned Lawyer", lawyers.find(l => l._id === formData.lawyerId)?.username || "Unassigned"]
    ];

    autoTable(doc, { // <-- Pass 'doc' as the first argument!
      startY: 38,
      head: [["Field", "Details"]],
      body: caseDetails,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138] }, 
      styles: { fontSize: 11, cellPadding: 5 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
    });

    // --- Add Hearings Table ---
    if (caseHearings && caseHearings.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(30, 58, 138);
      doc.text("Hearing History", 14, doc.lastAutoTable.finalY + 15);
      
      const hearingBody = caseHearings.map(h => [
        new Date(h.date).toLocaleDateString(),
        h.remarks,
        h.nextHearingDate ? new Date(h.nextHearingDate).toLocaleDateString() : "N/A"
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [["Date", "Remarks", "Next Hearing"]],
        body: hearingBody,
        theme: 'striped',
        headStyles: { fillColor: [71, 85, 105] }, // Slate gray
      });
    }

    // --- Add Documents Table ---
    if (caseDocuments && caseDocuments.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(30, 58, 138);
      doc.text("Attached Documents", 14, doc.lastAutoTable.finalY + 15);
      
      const docBody = caseDocuments.map(d => [
        d.title,
        new Date(d.uploadedAt).toLocaleDateString()
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [["Document Title", "Upload Date"]],
        body: docBody,
        theme: 'striped',
        headStyles: { fillColor: [71, 85, 105] }, // Slate gray
      });
    }

    // 5. Download the PDF!
    doc.save(`Case_Report_${id}.pdf`);
  };

  const daysSinceOpened = caseCreatedAt ? Math.floor((new Date() - new Date(caseCreatedAt)) / (1000 * 60 * 60 * 24)) : 0;
  
  // Find the next upcoming hearing date that is in the future
  const now = new Date();
  const futureHearings = caseHearings.filter(h => h.nextHearingDate && new Date(h.nextHearingDate) > now);
  futureHearings.sort((a, b) => new Date(a.nextHearingDate) - new Date(b.nextHearingDate));
  const nextHearing = futureHearings.length > 0 
    ? new Date(futureHearings[0].nextHearingDate).toLocaleDateString() 
    : "None Scheduled";

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Case Overview</h2>
      
      {/* Quick Stats Summary Card */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '150px', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#64748b' }}>Total Hearings</h4>
          <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{caseHearings.length}</span>
        </div>
        <div style={{ flex: 1, minWidth: '150px', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#64748b' }}>Next Hearing</h4>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d97706', lineHeight: '2.5rem' }}>{nextHearing}</span>
        </div>
        <div style={{ flex: 1, minWidth: '150px', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#64748b' }}>Documents</h4>
          <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{caseDocuments.length}</span>
        </div>
        <div style={{ flex: 1, minWidth: '150px', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#64748b' }}>Days Open</h4>
          <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{daysSinceOpened}</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'details' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Court Details
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'hearing-records' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('hearing-records')}
        >
          Hearing Records
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'summary' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Manual Summary
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'ai-summary' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('ai-summary')}
        >
          ✨ AI Case Summary
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'ai-chatbot' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('ai-chatbot')}
        >
          🤖 AI Chatbot
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'case-inclination' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('case-inclination')}
        >
          ⚖️ Case Inclination
        </button>
      </div>

      {activeTab === 'details' && (
        <>
          <form className={styles.form} onSubmit={handleSubmit}>
            
            {/* Title is only editable by Admin/Clerk. Lawyers/Judges see it as read-only */}
            <label className={styles.inputGroup}>Title:
              <input 
                className={styles.input} 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                disabled={userRole === 'lawyer' || userRole === 'judge'} 
                required 
              />
            </label>
            
            <label className={styles.inputGroup}>Description:
              <textarea 
                className={styles.textarea} 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                required 
              />
            </label>
            
            <label className={styles.inputGroup}>Status:
              <select className={styles.select} name="status" value={formData.status} onChange={handleChange}>
                <option value="pending">Pending</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </label>

            {/* Only show Assignment dropdowns to Admins and Clerks */}
            {(userRole === 'admin' || userRole === 'clerk') && (
              <>
                <label className={styles.inputGroup}>Assigned Judge:
                  <select className={styles.select} name="judgeId" value={formData.judgeId} onChange={handleChange}>
                    <option value="">-- Unassigned --</option>
                    {judges.map(judge => (
                      <option key={judge._id} value={judge._id}>
                        Hon. {judge.username}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.inputGroup}>Assigned Lawyer:
                  <select className={styles.select} name="lawyerId" value={formData.lawyerId} onChange={handleChange}>
                    <option value="">-- Unassigned --</option>
                    {lawyers.map(lawyer => (
                      <option key={lawyer._id} value={lawyer._id}>
                        {lawyer.username} ({lawyer.email})
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className={styles.submitBtn}>
                Save Updates
              </button>
              
              <button 
                type="button" 
                onClick={generatePDF} 
                className={styles.submitBtn} 
                style={{ backgroundColor: '#475569' }}
              >
                📄 Download PDF Report
              </button>
            </div>
          </form>

          {/* Embedded Components for Hearings and Documents */}
          <CaseHearings caseId={id} userRole={userRole} />
          <CaseDocuments caseId={id} />
        </>
      )}
      
      {activeTab === 'hearing-records' && (
          <HearingRecords caseId={id} userRole={userRole} />
      )}

      {activeTab === 'ai-summary' && (
          <AICaseSummary caseId={id} userRole={userRole} />
      )}

      {activeTab === 'ai-chatbot' && (
          <CaseChatbot caseId={id} userRole={userRole} />
      )}

      {activeTab === 'case-inclination' && (
          <CaseInclinationScale caseId={id} userRole={userRole} />
      )}

      {activeTab === 'summary' && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.summaryContainer}>
            <p className={styles.summaryHelpText} style={{ color: '#64748b', marginBottom: '1rem', fontStyle: 'italic' }}>
              Write or update the official summary for this case. This information will be saved permanently.
            </p>
            <textarea 
              className={`${styles.textarea} ${styles.summaryTextarea}`} 
              name="summary" 
              value={formData.summary} 
              onChange={handleChange} 
              placeholder="Enter comprehensive case summary here..."
              style={{ minHeight: '300px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className={styles.submitBtn}>
              Save Summary
            </button>
            <button 
                type="button" 
                onClick={generatePDF} 
                className={styles.submitBtn} 
                style={{ backgroundColor: '#475569' }}
              >
                📄 Download PDF Report
              </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UpdateCase;