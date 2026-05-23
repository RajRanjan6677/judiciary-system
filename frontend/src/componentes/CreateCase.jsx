// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import styles from './Case.module.css';

// const CreateCase = () => {
//   const [lawyers, setLawyers] = useState([]);
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     caseNumber: '',
//     title: '',
//     description: '',
//     judgeName: '',
//     lawyerId: '' // Optional
//   });

//   // Fetch lawyers for the dropdown when the component loads
//   useEffect(() => {
//     const fetchLawyers = async () => {
//       try {
//         // Assuming you have a route that gets all users and you filter by role, 
//         // or a specific route like GET /users/lawyers
//         const res = await api.get('/users/lawyers'); 
//         setLawyers(res.data);
//       } catch (error) {
//         console.log("Failed to fetch lawyers", error);
//       }
//     };
//     fetchLawyers();
//   }, []);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       // If lawyerId is an empty string, send null so the backend handles it properly
//       const dataToSend = { ...formData, lawyerId: formData.lawyerId || null };
//       await api.post('/cases', dataToSend);
//       alert('Case created successfully!');
//       // Navigate back to dashboard (or all cases) based on role
//       navigate(-1); 
//     } catch (error) {
//       alert(error.response?.data?.message || "Failed to create case");
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <h2 className={styles.heading}>Register New Case</h2>
//       <form className={styles.form} onSubmit={handleSubmit}>
        
//         <label className={styles.inputGroup}>Case Number:
//           <input className={styles.input} type="number" name="caseNumber" value={formData.caseNumber} onChange={handleChange} required />
//         </label>
        
//         <label className={styles.inputGroup}>Title:
//           <input className={styles.input} type="text" name="title" value={formData.title} onChange={handleChange} required />
//         </label>
        
//         <label className={styles.inputGroup}>Description:
//           <textarea className={styles.textarea} name="description" value={formData.description} onChange={handleChange} required />
//         </label>
        
//         <label className={styles.inputGroup}>Judge Name:
//           <input className={styles.input} type="text" name="judgeName" value={formData.judgeName} onChange={handleChange} required />
//         </label>

//         <label className={styles.inputGroup}>Assign Lawyer (Optional):
//           <select className={styles.select} name="lawyerId" value={formData.lawyerId} onChange={handleChange}>
//             <option value="">-- Leave Unassigned --</option>
//             {lawyers.map(lawyer => (
//               <option key={lawyer._id} value={lawyer._id}>
//                 {lawyer.username} ({lawyer.email})
//               </option>
//             ))}
//           </select>
//         </label>

//         <button type="submit" className={styles.submitBtn}>Create Case</button>
//       </form>
//     </div>
//   );
// };

// export default CreateCase;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import styles from './Case.module.css';

const CreateCase = () => {
  const [lawyers, setLawyers] = useState([]);
  const [judges, setJudges] = useState([]); // <-- State for Judges
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    caseNumber: '',
    title: '',
    description: '',
    lawyerId: '', // Optional
    judgeId: ''   // Optional (or required, depending on your preference)
  });

  // Fetch both lawyers and judges when the component loads
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch both lists at the same time for better performance
        // Note: adjust the '/auth' or '/users' base path based on your setup!
        const [lawyersRes, judgesRes] = await Promise.all([
          api.get('/auth/lawyers'), 
          api.get('/auth/judges')
        ]);
        
        setLawyers(lawyersRes.data);
        setJudges(judgesRes.data);
      } catch (error) {
        console.log("Failed to fetch user lists", error);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send null if IDs are empty strings so the backend handles it properly
      const dataToSend = { 
        ...formData, 
        lawyerId: formData.lawyerId || null,
        judgeId: formData.judgeId || null 
      };
      
      await api.post('/cases', dataToSend);
      alert('Case created successfully!');
      navigate(-1); 
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create case");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Register New Case</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        
        <label className={styles.inputGroup}>Case Number:
          <input className={styles.input} type="number" name="caseNumber" value={formData.caseNumber} onChange={handleChange} required />
        </label>
        
        <label className={styles.inputGroup}>Title:
          <input className={styles.input} type="text" name="title" value={formData.title} onChange={handleChange} required />
        </label>
        
        <label className={styles.inputGroup}>Description:
          <textarea className={styles.textarea} name="description" value={formData.description} onChange={handleChange} required />
        </label>
        
        {/* NEW: Judge Assignment Dropdown */}
        <label className={styles.inputGroup}>Assign Judge (Optional):
          <select className={styles.select} name="judgeId" value={formData.judgeId} onChange={handleChange}>
            <option value="">-- Leave Unassigned --</option>
            {judges.map(judge => (
              <option key={judge._id} value={judge._id}>
                Hon. {judge.username}
              </option>
            ))}
          </select>
        </label>

        {/* Lawyer Assignment Dropdown */}
        <label className={styles.inputGroup}>Assign Lawyer (Optional):
          <select className={styles.select} name="lawyerId" value={formData.lawyerId} onChange={handleChange}>
            <option value="">-- Leave Unassigned --</option>
            {lawyers.map(lawyer => (
              <option key={lawyer._id} value={lawyer._id}>
                {lawyer.username} ({lawyer.email})
              </option>
            ))}
          </select>
        </label>

        <button type="submit" className={styles.submitBtn}>Create Case</button>
      </form>
    </div>
  );
};

export default CreateCase;