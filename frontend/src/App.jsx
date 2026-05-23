import React, { useEffect, useState } from 'react'
import api from "./api/axios"
import {BrowserRouter,Routes,Route,useNavigate,Navigate} from "react-router-dom"
import Lawyer from './pages/Lawyer'
import Clerk from './pages/Clerk'
import Admin from './pages/Admin'
import Login from './auth/Login'
import Register from './auth/Register'
import ProtectedRoute from './auth/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import CaseList from './componentes/CaseList'
import CreateCase from './componentes/CreateCase'
import AddLawyer from './componentes/AddUser'
import AllUsers from './componentes/AllUsers'
import UpdateCase from './componentes/UpdateCase'
import HearingList from './componentes/HearingList'
import SystemLogs from './componentes/SystemLogs';
import Judge from './pages/Judge'
const App=()=>{
  return (
    <BrowserRouter>
      {/* <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path="/lawyer" element={
          <ProtectedRoute allowedRoles={["lawyer"]}>
            <Lawyer />
          </ProtectedRoute>
          } />
      <Route path="/clerk" element={
          <ProtectedRoute allowedRoles={["clerk"]}>
            <Clerk />
          </ProtectedRoute>
          } />
      <Route path="/admin" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Admin />
          </ProtectedRoute>
          } />
      </Routes> */}
      <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />

      {/* --- ADMIN ROUTES --- */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <Admin />
        </ProtectedRoute>
      }>
        {/* These load inside the <Admin /> component */}
        <Route index element={<Dashboard />} />
        {/* <Route path="create-case" element={<div>Admin Create Case</div>} /> */}
        <Route path="create-case" element={<CreateCase />} />
        {/* <Route path="hearings" element={<div>Admin Hearings</div>} /> */}
        <Route path="hearings" element={<HearingList />} />
        {/* <Route path="all-cases" element={<div>Admin All Cases</div>} /> */}
        <Route path="all-cases" element={<CaseList title="All System Cases" />} />
        {/* <Route path="all-users" element={<div>Admin All Users</div>} /> */}
        <Route path="all-users" element={<AllUsers />} />
        {/* <Route path="add-lawyer" element={<div>Admin Add Lawyer</div>} /> */}
        <Route path="add-lawyer" element={<AddLawyer />} />
        {/* <Route path="case-update" element={<div>Admin Case Update</div>} /> */}
        <Route path="case-update/:id" element={<UpdateCase />} />
        <Route path="logs" element={<SystemLogs />} />
      </Route>

      {/* --- CLERK ROUTES --- */}
      <Route path="/clerk" element={
        <ProtectedRoute allowedRoles={["clerk"]}>
          <Clerk />
        </ProtectedRoute>
      }>
        {/* These load inside the <Clerk /> component */}
        <Route index element={<Dashboard />} />
        {/* <Route path="all-lawyers" element={<div>Clerk All Lawyers</div>} /> */}
        <Route path="all-lawyers" element={<AllUsers fetchOnlyLawyers={true} />} />
        {/* <Route path="create-case" element={<div>Clerk Create Case</div>} /> */}
        <Route path="create-case" element={<CreateCase />} />
        {/* <Route path="hearings" element={<div>Clerk Hearings</div>} /> */}
        <Route path="hearings" element={<HearingList />} />
        {/* <Route path="all-cases" element={<div>Clerk All Cases</div>} /> */}
        <Route path="all-cases" element={<CaseList title="Manage All Cases" />} />
        {/* <Route path="add-lawyer" element={<div>Clerk Add Lawyer</div>} /> */}
        <Route path="add-lawyer" element={<AddLawyer />} />
        {/* <Route path="case-update" element={<div>Clerk Case Update</div>} /> */}
        <Route path="case-update/:id" element={<UpdateCase />} />
      </Route>

      {/* --- LAWYER ROUTES --- */}
      <Route path="/lawyer" element={
        <ProtectedRoute allowedRoles={["lawyer"]}>
          <Lawyer />
        </ProtectedRoute>
      }>
        {/* These load inside the <Lawyer /> component */}
        <Route index element={<Dashboard />} />
        {/* <Route path="assigned-cases" element={<div>Lawyer Assigned Cases</div>} /> */}
        <Route path="assigned-cases" element={<CaseList title="My Assigned Cases" />} />
        {/* <Route path="hearing-date" element={<div>Lawyer Hearing Dates</div>} /> */}
        <Route path="hearing-date" element={<HearingList />} />
        <Route path="document-upload" element={<div>Lawyer Document Upload</div>} />
        <Route path="case-update/:id" element={<UpdateCase />} />
      </Route>
      {/* --- JUDGE ROUTES --- */}
      <Route path="/judge" element={
        <ProtectedRoute allowedRoles={["judge"]}>
          {/* You might need to create a simple Judge Layout/Wrapper like we did for Admin */}
          <Judge /> 
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        {/* Reusing the CaseList and HearingList! */}
        <Route path="all-cases" element={<CaseList title="System Cases" />} />
        <Route path="hearings" element={<HearingList />} />
        {/* So they can click "View Case" and see the details/documents */}
        <Route path="case-update/:id" element={<UpdateCase />} /> 
        <Route path="logs" element={<SystemLogs />} />
      </Route>
    </Routes>
    </BrowserRouter>
  )
}
export default App