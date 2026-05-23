import React from 'react'
import Navbar from '../componentes/Navbar'
import Dashboard from './Dashboard'
import { Outlet } from 'react-router-dom'
const Lawyer = () => {
  return (
    <>
    <Navbar/>
    <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
    </>
  )
}

export default Lawyer