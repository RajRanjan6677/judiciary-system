
// import React, { useState,useEffect} from 'react'
// import { useNavigate } from 'react-router-dom'
// import api from '../api/axios'
// import styles from './Register.module.css' // <-- Imported the styles here

// const Register = () => {
//     const [form,setFrom]=useState({
//         username:"",
//         email:"",
//         password:"",
//         role:"lawyer"
//     })
//     const navigate=useNavigate()
//     useEffect(()=>{
//             const checkAuth=async ()=>{
//                 try {
//                     const res=await api.get("/auth/check")
//                     const role=res.data.role
//                     if(role)
//                         navigate(`/${role}`)
//                 } catch (error) {
//                     console.log("stay")
//                 }
//             }
//             checkAuth()
//         })
//     const handleRegister=async(e)=>{
//         e.preventDefault()
//         try {
//             const res=await api.post("/auth/register",form)
//             const {user}=res.data
//             navigate(`/${user.role}`)
//         } catch (error) {
//             alert("registeration failed")
//         }
//     }
//   return (
//     <>
//     <form className={styles.form} onSubmit={handleRegister}>
//         <h2 className={styles.heading}>login</h2>
//         <label className={styles.label}>name:
//             <input className={styles.input} type="text" placeholder='name'onChange={e=>setFrom({...form,username:e.target.value})}/>
//         </label>
//         <label className={styles.label}>Login:
//             <input className={styles.input} type="email" placeholder='Email'onChange={e=>setFrom({...form,email:e.target.value})}/>
//         </label>
//         <label className={styles.label}>Password:
//             <input className={styles.input} type="password" placeholder='Password'onChange={e=>setFrom({...form,password:e.target.value})}/>
//         </label>
//         <select className={styles.select} onChange={e=>setFrom({...form,role:e.target.value})}>
//             <option value="lawyer">lawyer</option>
//             <option value="admin">admin</option>
//             <option value="clerk">clerk</option>
//             <option value="judge">judge</option>
//         </select>
//         <button className={styles.submitBtn} onSubmit={handleRegister}>Register</button>
//     </form>
//     <button className={styles.navigateBtn} onClick={()=>navigate('/login')}>Login</button>
//     </>
//   )
// }

// export default Register
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import styles from './Login.module.css';

const Register = () => {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        role: "lawyer" // Default role
    });
    
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await api.get("/auth/check");
                const role = res.data.role;
                if (role) {
                    navigate(`/${role}`); // Send them to their dashboard if already logged in
                }
            } catch (error) {
                console.log("Not logged in, staying on register page.");
            }
        };
        checkAuth();
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/auth/register", form);
            const { user } = res.data;
            alert("Registration successful!");
            navigate(`/${user.role}`);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Registration failed. Please check your details.";
            alert(errorMessage);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.brand}>
                    <div className={styles.logo}>§</div>
                    <h2 className={styles.heading}>Supreme Kourt of India</h2>
                    <p className={styles.subheading}>e-Courts Case Management System</p>
                </div>

                <h3 style={{textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary-navy)', fontFamily: 'var(--font-heading)'}}>
                    Register Account
                </h3>

                <form className={styles.form} onSubmit={handleRegister}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Full Name</label>
                        <input 
                            className={styles.input} 
                            type="text" 
                            placeholder='Enter your full name'
                            required
                            onChange={e => setForm({ ...form, username: e.target.value })} 
                        />
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input 
                            className={styles.input} 
                            type="email" 
                            placeholder='Enter your email address'
                            required
                            onChange={e => setForm({ ...form, email: e.target.value })} 
                        />
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
                        <input 
                            className={styles.input} 
                            type="password" 
                            placeholder='Create a password (min. 6 characters)'
                            required
                            minLength={6}
                            onChange={e => setForm({ ...form, password: e.target.value })} 
                        />
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Role</label>
                        <select 
                            className={styles.input} 
                            style={{appearance: 'auto'}}
                            value={form.role}
                            onChange={e => setForm({ ...form, role: e.target.value })}
                        >
                            <option value="lawyer">Lawyer</option>
                            <option value="admin">Admin</option>
                            <option value="clerk">Clerk</option>
                            <option value="judge">Judge</option>
                        </select>
                    </div>
                    
                    <button type="submit" className={styles.submitBtn}>
                        Register
                    </button>
                </form>
                
                <div className={styles.divider}>Already have an account?</div>
                
                <button className={styles.navigateBtn} onClick={() => navigate('/login')}>
                    Secure Login
                </button>
            </div>
        </div>
    );
};

export default Register;