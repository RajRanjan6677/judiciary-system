// import React, { useEffect, useState } from 'react'
// import api from '../api/axios'
// import { Navigate,useNavigate } from 'react-router-dom'

// const ProtectedRoute = ({children,allowedRoles}) => {
//     const [loading,setLoading]=useState(true)
//     const [authorized,setAuthorized]=useState(false)
//     const navigate=useNavigate()
//     useEffect(()=>{
//         const checkRole=async ()=>{
//             try {
//                 const res=await api.get("/auth/check")
//                 const role=res.data.role
//                 if(!allowedRoles||allowedRoles.includes(role))
//                     setAuthorized(true)
//             } catch (error) {
//                 setAuthorized(false)
//             }
//             finally{
//                 setLoading(false)
//             }
//             checkRole()
//         }
//         checkRole()
//     },[])
//     if(loading) return <div>loading</div>
//     if(!authorized) return <Navigate to="/login" replace/>
//   return children
// }

// export default ProtectedRoute
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const checkRole = async () => {
            try {
                const res = await api.get("/auth/check");
                const role = res.data.role;
                
                if (!allowedRoles || allowedRoles.includes(role)) {
                    setAuthorized(true);
                } else {
                    setAuthorized(false);
                }
            } catch (error) {
                // Fails silently on a 401 Unauthorized
                setAuthorized(false);
            } finally {
                setLoading(false);
            }
        };
        
        // Call it ONCE here to start the check
        checkRole();
    }, []); // The empty array ensures this useEffect only runs once per mount

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Verifying access...</div>;
    
    if (!authorized) return <Navigate to="/login" replace />;
    
    return children;
};

export default ProtectedRoute;