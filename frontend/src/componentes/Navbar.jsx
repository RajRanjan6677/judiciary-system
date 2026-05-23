import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import styles from './Navbar.module.css';

const Navbar = () => {
    const [role,setRole]=useState()
  const navigate = useNavigate();
      useEffect(()=>{
          const checkAuth=async ()=>{
              try {
                  const res=await api.get("/auth/check")
                  const role=res.data.role
                  if(role)
                      setRole(role)
              } catch (error) {
                  console.log("stay")
              }
          }
          checkAuth()
      },[])
  const handleLogout = async () => {
    try {
      // Assuming you have a logout endpoint to clear cookies/tokens
      await api.post("/auth/logout");
      setRole(null); // Clear the role from state
      navigate("/login");
    } catch (error) {
      console.log("Logout failed", error);
    }
  };

  return (
    // <nav className={styles.navbar}>
    //   <Link to="/" className={styles.brand}>
    //     LegalSystem
    //   </Link>

    //   <div className={styles.navLinks}>
    //     {/* Links for Admin */}
    //     {role === "admin" && (
    //       <>
    //         <Link to="/admin/dashboard" className={styles.link}>Dashboard</Link>
    //         <Link to="/admin/add-lawyer" className={styles.link}>Add Lawyer</Link>
    //         <Link to="/cases" className={styles.link}>All Cases</Link>
    //       </>
    //     )}

    //     {/* Links for Clerk */}
    //     {role === "clerk" && (
    //       <>
    //         <Link to="/clerk/dashboard" className={styles.link}>Dashboard</Link>
    //         <Link to="/cases/new" className={styles.link}>Add Case</Link>
    //         <Link to="/cases" className={styles.link}>Manage Cases</Link>
    //       </>
    //     )}

    //     {/* Links for Lawyer */}
    //     {role === "lawyer" && (
    //       <>
    //         <Link to="/lawyer/dashboard" className={styles.link}>My Dashboard</Link>
    //         <Link to="/lawyer/my-cases" className={styles.link}>My Cases</Link>
    //       </>
    //     )}

    //     {/* Links for Unauthenticated Users */}
    //     {!role && (
    //       <>
    //         <Link to="/login" className={styles.link}>Login</Link>
    //         <Link to="/register" className={styles.link}>Register</Link>
    //       </>
    //     )}

    //     {/* Logout Button (Only show if logged in) */}
    //     {role && (
    //       <button className={styles.logoutBtn} onClick={handleLogout}>
    //         Logout
    //       </button>
    //     )}
    //   </div>
    // </nav>
    <nav className={styles.navbar}>
      <Link to="/" className={styles.brandContainer}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e6/Emblem_of_the_Supreme_Court_of_India.svg" alt="Supreme Court Logo" className={styles.logoImage} />
        <div className={styles.brandText}>
          <span className={styles.brandHindi}>भारत का सर्वोच्च न्यायालय</span>
          <span className={styles.brandEnglish}>Supreme Kourt of India</span>
          <span className={styles.brandMotto}>|| यतो धर्मस्ततो जय: ||</span>
        </div>
      </Link>

      <div className={styles.navLinks}>
        {/* Links for Admin */}
        {role === "admin" && (
          <>
            <Link to="/admin" className={styles.link}>Dashboard</Link>
            <Link to="/admin/create-case" className={styles.link}>Create Case</Link>
            <Link to="/admin/hearings" className={styles.link}>Hearings</Link>
            <Link to="/admin/all-cases" className={styles.link}>All Cases</Link>
            <Link to="/admin/all-users" className={styles.link}>All Users</Link>
            <Link to="/admin/add-lawyer" className={styles.link}>Add User</Link>
            <Link to="/admin/logs" className={styles.link}>System logs</Link>
            {/* <Link to="/admin/case-update" className={styles.link}>Update Case</Link> */}
          </>
        )}

        {/* Links for Clerk */}
        {role === "clerk" && (
          <>
            <Link to="/clerk" className={styles.link}>Dashboard</Link>
            <Link to="/clerk/create-case" className={styles.link}>Create Case</Link>
            <Link to="/clerk/hearings" className={styles.link}>Hearings</Link>
            <Link to="/clerk/all-cases" className={styles.link}>All Cases</Link>
            <Link to="/clerk/all-lawyers" className={styles.link}>All Lawyers</Link>
            <Link to="/clerk/add-lawyer" className={styles.link}>Add Lawyer</Link>
            {/* <Link to="/clerk/case-update" className={styles.link}>Update Case</Link> */}
          </>
        )}

        {/* Links for Lawyer */}
        {role === "lawyer" && (
          <>
            <Link to="/lawyer" className={styles.link}>Dashboard</Link>
            <Link to="/lawyer/assigned-cases" className={styles.link}>Assigned Cases</Link>
            <Link to="/lawyer/hearing-date" className={styles.link}>Hearing Dates</Link>
            {/* <Link to="/lawyer/case-update" className={styles.link}>Update Case</Link> */}
            {/* <Link to="/lawyer/document-upload" className={styles.link}>Upload Docs</Link> */}
          </>
        )}
        {/* Links for Judge */}
        {role === "judge" && (
          <>
            <Link to="/judge" className={styles.link}>Dashboard</Link>
            <Link to="/judge/all-cases" className={styles.link}>All Cases</Link>
            <Link to="/judge/hearings" className={styles.link}>Hearing Schedule</Link>
            <Link to="/judge/logs" className={styles.link}>Case logs</Link>
          </>
        )}

        {/* Links for Unauthenticated Users */}
        {!role && (
          <>
            <Link to="/login" className={styles.link}>Login</Link>
            <Link to="/register" className={styles.link}>Register</Link>
          </>
        )}

        {/* Logout Button (Only show if logged in) */}
        {role && (
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;