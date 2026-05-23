// import React, { useEffect, useState } from 'react';
// import api from '../api/axios';
// import styles from './User.module.css';

// const AllUsers = ({ fetchOnlyLawyers = false }) => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         // Dynamically choose the endpoint based on the prop
//         const endpoint = fetchOnlyLawyers ? '/auth/lawyers' : '/auth';
//         const res = await api.get(endpoint);
//         setUsers(res.data);
//       } catch (error) {
//         console.log("Failed to fetch users", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchUsers();
//   }, [fetchOnlyLawyers]);

//   if (loading) return <div className={styles.container}>Loading users...</div>;

//   return (
//     <div className={styles.container}>
//       <h2 className={styles.heading}>
//         {fetchOnlyLawyers ? "All Lawyers" : "System Users"}
//       </h2>
      
//       {users.length === 0 ? (
//         <p>No users found.</p>
//       ) : (
//         <div className={styles.tableContainer}>
//           <table className={styles.userTable}>
//             <thead>
//               <tr>
//                 <th>Name</th>
//                 <th>Email</th>
//                 <th>Role</th>
//               </tr>
//             </thead>
//             <tbody>
//               {users.map((user) => (
//                 <tr key={user._id}>
//                   <td>{user.username}</td>
//                   <td>{user.email}</td>
//                   <td>
//                     <span className={`${styles.roleBadge} ${styles[user.role]}`}>
//                       {user.role}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AllUsers;
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import styles from './User.module.css';

const AllUsers = ({ fetchOnlyLawyers = false }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Dynamically choose the endpoint based on the prop
        const endpoint = fetchOnlyLawyers ? '/auth/lawyers' : '/auth';
        const res = await api.get(endpoint);
        setUsers(res.data);
      } catch (error) {
        console.log("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [fetchOnlyLawyers]);

  // --- NEW DELETE FUNCTION ---
  const handleDelete = async (userId) => {
    // Add a confirmation dialog so users don't accidentally delete someone
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      // Assuming your delete route matches your get route base
      await api.delete(`/auth/${userId}`);
      
      // Update the local state to remove the user instantly without refreshing
      setUsers(users.filter((user) => user._id !== userId));
      alert("User deleted successfully");
    } catch (error) {
      console.log("Failed to delete user", error);
      alert(error.response?.data?.message || "Failed to delete user");
    }
  };

  if (loading) return <div className={styles.container}>Loading users...</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>
        {fetchOnlyLawyers ? "All Lawyers" : "System Users"}
      </h2>
      
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th> {/* Added Actions Column */}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${styles[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {/* Added Delete Button */}
                    <button 
                      className={styles.deleteBtn} 
                      onClick={() => handleDelete(user._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllUsers;