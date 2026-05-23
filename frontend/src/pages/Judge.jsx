import React from 'react'
import { Outlet } from 'react-router-dom' // <-- Import Outlet
import Navbar from '../componentes/Navbar'

const Judge = () => {
  return (
    <>
      <Navbar />
      {/* The Outlet injects the active child component here */}
      <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
    </> 
  )
}

export default Judge