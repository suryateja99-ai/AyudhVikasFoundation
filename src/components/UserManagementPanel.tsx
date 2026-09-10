import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export const UserManagementPanel: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    api.users().then((res) => setUsers(res.items || []));
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      (!searchQuery || String(u.name || '').toLowerCase().includes(searchQuery.toLowerCase())) &&
      (!selectedRole || u.role === selectedRole || (u.roles || []).includes(selectedRole))
  );

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure? This cannot be undone.')) return;
    await api.removeUser(userId);
    setUsers(users.filter((u) => u.id !== userId));
  };

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border rounded text-xs font-semibold"
        />
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2 border rounded text-xs font-black"
        >
          <option value="">All Roles</option>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="hospital">Hospital</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="p-3 font-bold">{user.name}</td>
                <td className="p-3">{(user.roles || [user.role]).join(', ')}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.phone}</td>
                <td className="p-3">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td>
                <td className="p-3">
                  <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-800 font-black cursor-pointer">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
