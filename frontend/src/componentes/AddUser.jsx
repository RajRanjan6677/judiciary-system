import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import styles from './User.module.css';

const AddUser = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'lawyer'
  });
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await api.get("/auth/check");
        setCurrentUserRole(res.data.role);
      } catch (error) {
        console.log("Failed to check role");
      }
    };
    checkRole();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/addUser', formData);
      alert(`${formData.role} added successfully!`);
      navigate(-1);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add user");
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <h2 className={styles.heading}>Add New User</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Full Name</label>
            <input className={styles.input} type="text" name="username" placeholder="Enter full name" value={formData.username} onChange={handleChange} required />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Address</label>
            <input className={styles.input} type="email" name="email" placeholder="Enter email address" value={formData.email} onChange={handleChange} required />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" name="password" placeholder="Create a password (min. 6 chars)" value={formData.password} onChange={handleChange} minLength={6} required />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Role</label>
            <select className={styles.select} name="role" value={formData.role} onChange={handleChange} style={{appearance: 'auto'}}>
              <option value="lawyer">Lawyer</option>
              <option value="clerk">Clerk</option>
              {currentUserRole === 'admin' && (
                <>
                  <option value="admin">Admin</option>
                  <option value="judge">Judge</option>
                </>
              )}
            </select>
          </div>
          
          <button type="submit" className={styles.submitBtn}>Register User</button>
        </form>
      </div>
    </div>
  );
};

export default AddUser;