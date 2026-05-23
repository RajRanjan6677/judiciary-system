import React, { useEffect, useState } from 'react'
import {useNavigate} from "react-router-dom"
import api from '../api/axios.js'
import styles from './Login.module.css'

const Login = () => {
    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")
    const navigate=useNavigate()
    
    useEffect(()=>{
        const checkAuth=async ()=>{
            try {
                const res=await api.get("/auth/check")
                const role=res.data.role
                if(role)
                    navigate(`/${role}`)
            } catch (error) {
                console.log("stay")
            }
        }
        checkAuth()
    },[])
    
    const handleLogin=async(e)=>{
        e.preventDefault()
        try {
            const res=await api.post("/auth/login",{email,password})
            console.log(res.data)
            const {user}=res.data
            navigate(`/${user.role}`)
        } catch (error) {
            alert("Login failed. Please check your credentials.")
        }
    }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/e/e6/Emblem_of_the_Supreme_Court_of_India.svg" alt="Supreme Court Logo" className={styles.logoImage} />
          <div className={styles.brandTextContainer}>
            <span className={styles.brandHindi}>भारत का सर्वोच्च न्यायालय</span>
            <h2 className={styles.heading}>Supreme Kourt of India</h2>
            <span className={styles.brandMotto}>|| यतो धर्मस्ततो जय: ||</span>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleLogin}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email Address</label>
              <input 
                className={styles.input} 
                type="email" 
                placeholder='Enter your email'
                required
                onChange={e=>setEmail(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Password</label>
              <input 
                className={styles.input} 
                type="password" 
                placeholder='Enter your password'
                required
                onChange={e=>setPassword(e.target.value)}
              />
            </div>
            
            <button type="submit" className={styles.submitBtn}>Secure Login</button>
        </form>

        <div className={styles.divider}>New User?</div>
        
        <button className={styles.navigateBtn} onClick={()=>navigate('/register')}>
          Register Account
        </button>
      </div>
    </div>
  )
}

export default Login