// import React, { useEffect, useState } from 'react';
// import api from '../api/axios';
// import styles from './Case.module.css';
// import { useNavigate } from 'react-router-dom';
// const CaseList = ({ title }) => {
//   const [cases, setCases] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();
//   useEffect(() => {
//     const fetchCases = async () => {
//       try {
//         const res = await api.get('/cases');
//         setCases(res.data);
//       } catch (error) {
//         console.log("Failed to fetch cases", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCases();
//   }, []);

//   if (loading) return <div className={styles.container}>Loading cases...</div>;

//   return (
//     <div className={styles.container}>
//       <h2 className={styles.heading}>{title || "Court Cases"}</h2>
      
//       {cases.length === 0 ? (
//         <p>No cases found.</p>
//       ) : (
//         cases.map((courtCase) => (
//           <div key={courtCase._id} className={styles.caseCard}>
//             <div className={styles.caseHeader}>
//               <h3>Case #{courtCase.caseNumber}: {courtCase.title}</h3>
//               <span className={styles.status}>{courtCase.status}</span>
//             </div>
//             {/* <p><strong>Judge:</strong> {courtCase.judgeName}</p> */}
//             <p><strong>Judge:</strong> {courtCase.judgeId ? courtCase.judgeId.username : "Unassigned"}</p>
//             <p><strong>Lawyer:</strong> {courtCase.lawyerId ? courtCase.lawyerId.username : "Unassigned"}</p>
//             <p>{courtCase.description}</p>
//             {/* You can add a Link here to view details/update the case later */}
//             <button 
//               className={styles.submitBtn} // You can reuse this class or make a new one
//                style={{ marginTop: '10px' }}
//               onClick={() => navigate(`../case-update/${courtCase._id}`)}
//             >
//             Edit Case
//             </button>
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default CaseList;
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import styles from './Case.module.css';
import { useNavigate } from 'react-router-dom';

const CaseList = ({ title }) => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New States for Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const navigate = useNavigate();

  const fetchCases = async () => {
    setLoading(true);
    try {
      // Pass the search and status as URL query parameters
      const res = await api.get(`/cases?search=${searchTerm}&status=${statusFilter}`);
      setCases(res.data);
    } catch (error) {
      console.log("Failed to fetch cases", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cases when the component loads, or when the user changes the status dropdown
  useEffect(() => {
    fetchCases();
  }, [statusFilter]);

  // Handle the Search Form submission
  const handleSearch = (e) => {
    e.preventDefault();
    fetchCases(); // Trigger a fetch with the new search term
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    // The useEffect will automatically re-fetch when statusFilter resets to ''
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>{title || "Court Cases"}</h2>
      
      {/* --- NEW: Search and Filter Bar --- */}
      <form className={styles.filterBar} onSubmit={handleSearch}>
        <input 
          type="text" 
          placeholder="Search by Title or Case Number..." 
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select 
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="closed">Closed</option>
        </select>
        
        <button type="submit" className={styles.searchBtn}>Search</button>
        
        {(searchTerm || statusFilter) && (
          <button type="button" className={styles.clearBtn} onClick={clearFilters}>
            Clear
          </button>
        )}
      </form>

      {/* --- Case List Rendering --- */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading cases...</div>
      ) : cases.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>No cases found matching your criteria.</p>
      ) : (
        cases.map((courtCase) => (
          <div key={courtCase._id} className={styles.caseCard}>
            <div className={styles.caseHeader}>
              <h3>Case #{courtCase.caseNumber}: {courtCase.title}</h3>
              <span className={`${styles.status} ${styles[courtCase.status] || ''}`}>
                {courtCase.status}
              </span>
            </div>
            <p><strong>Judge:</strong> {courtCase.judgeId ? `Hon. ${courtCase.judgeId.username}` : "Unassigned"}</p>
            <p><strong>Lawyer:</strong> {courtCase.lawyerId ? `${courtCase.lawyerId.username}` : "Unassigned"}</p>
            <p>{courtCase.description}</p>
            
            <button 
              className={styles.submitBtn} 
               style={{ marginTop: '1rem' }}
              onClick={() => navigate(`../case-update/${courtCase._id}`)}
            >
              View / Edit Case
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default CaseList;