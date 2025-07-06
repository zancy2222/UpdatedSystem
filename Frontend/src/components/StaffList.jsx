// src/components/StaffList.jsx
import React from 'react';
import { ChevronUp, ChevronDown, Trash2, Edit } from 'lucide-react';

const StaffList = ({
  filteredStaff,
  sortConfig,
  requestSort,
  formatPosition,
  calculateAge,
  handleDelete,
  handleEdit  // Add this prop
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {[
              { key: 'id', label: 'ID' },
              { key: 'lastname', label: 'Name' },
              { key: null, label: 'Username' },
              { key: 'position', label: 'Position' },
              { key: null, label: 'Email' },
              { key: 'birthday', label: 'Age' },
              { key: null, label: 'Sex' },
              { key: null, label: 'Actions', align: 'text-right' }
            ].map(({ key, label, align }) => (
              <th
                key={label}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  align || ''
                } ${key ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                onClick={key ? () => requestSort(key) : undefined}
              >
                <div className="flex items-center">
                  {label}
                  {sortConfig.key === key && (
                    sortConfig.direction === 'asc' ? (
                      <ChevronUp size={16} className="ml-1" />
                    ) : (
                      <ChevronDown size={16} className="ml-1" />
                    )
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredStaff.map((member, index) => (
            <tr key={member.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.id}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {member.lastname}, {member.firstname} {member.middlename}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.username}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-medium">
                  {formatPosition(member.position)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{calculateAge(member.birthday)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.sex}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(member)}
                    className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  {/* <button
                    onClick={() => handleDelete(member.id)}
                    className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button> */}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffList;