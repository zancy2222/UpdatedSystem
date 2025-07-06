import { useState, useEffect } from 'react';
import axios from 'axios';
import UserAdd from './UserAdd'; // Import the UserAdd component
import UserUpdate from './UserUpdate'; // Import the UserUpdate component

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null); // Selected user for editing
    const [showModal, setShowModal] = useState(false); // State for showing the modal

    // Fetch users
    useEffect(() => {
        loadUsers();
    }, []);

   const loadUsers = async () => {
    try {
        const response = await axios.get('http://localhost:8000/api/users/');
        // Filter out users with position === 'client'
        const filteredUsers = response.data.filter(user => user.position.toLowerCase() !== 'client');
        setUsers(filteredUsers);
    } catch (error) {
        console.error('Error loading users:', error);
    }
};

    // Open the user update modal and set the selected user
    const openUpdateModal = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    // Close the user update modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">User Management</h2>

            {/* Pass loadUsers callback to UserAdd to refresh the user list */}
            <UserAdd onUserAdded={loadUsers} />

            {/* Table for displaying users */}
            <div className="overflow-x-auto mt-6" style={{ maxHeight: '400px', overflowY: 'scroll' }}>
                <table className="min-w-full table-auto border-collapse border border-gray-300">
                    <thead className='bg-black text-white'>   
                        <tr>
                            <th className="border-b px-4 py-2">ID</th>
                            <th className="border-b px-4 py-2">Last Name</th>
                            <th className="border-b px-4 py-2">First Name</th>
                            <th className="border-b px-4 py-2">Middle Initial</th>
                            <th className="border-b px-4 py-2">Address</th>
                            <th className="border-b px-4 py-2">User Type</th>
                            <th className="border-b px-4 py-2">Username</th>
                            <th className="border-b px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <td className="border-b px-4 py-2">{user.id}</td>
                                    <td className="border-b px-4 py-2">{user.lastname}</td>
                                    <td className="border-b px-4 py-2">{user.firstname}</td>
                                    <td className="border-b px-4 py-2">{user.middlename}</td>
                                    <td className="border-b px-4 py-2">{user.address}</td>
                                    <td className="border-b px-4 py-2">{user.position}</td>
                                    <td className="border-b px-4 py-2">{user.username}</td>
                                    <td className="border-b px-4 py-2">
                                        <button
                                            className="bg-[#20315d] 500 text-white px-3 py-1 rounded-lg"
                                            onClick={() => openUpdateModal(user)} // Open the modal on "Edit" click
                                        >
                                            Edit
                                        </button>
                                        
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center py-4">No Records Found!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Show the modal for updating a user */}
            {showModal && selectedUser && (
                <UserUpdate
                    user={selectedUser} // Pass the selected user to the modal
                    onUserUpdated={loadUsers} // Refresh the user list after update
                    closeModal={closeModal} // Close the modal after update
                />
            )}
        </div>
    );
}
