import React, { useState } from 'react';
import { X, Wrench } from 'lucide-react';
import { dataStore } from '../utils/dataStore';

const EquipmentForm = ({ equipment, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: equipment?.name || '',
    serialNumber: equipment?.serialNumber || '',
    purchaseDate: equipment?.purchaseDate || '',
    warrantyExpiry: equipment?.warrantyExpiry || '',
    location: equipment?.location || '',
    department: equipment?.department || '',
    assignedTeamId: equipment?.assignedTeamId || '',
  });

  const teams = dataStore.getTeams();
  const requests = dataStore.getRequests();
  const openRequestsCount = equipment 
    ? requests.filter(r => r.equipmentId === equipment.id && (r.status === 'New' || r.status === 'In Progress')).length
    : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      assignedTeamId: parseInt(formData.assignedTeamId)
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-90vh overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {equipment ? 'Edit Equipment' : 'Add New Equipment'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {equipment && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-blue-900">Maintenance Requests</div>
                <div className="text-xs text-blue-700">Open requests for this equipment</div>
              </div>
              <div className="flex items-center">
                <Wrench className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-lg font-bold text-blue-600">{openRequestsCount}</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Equipment Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Serial Number *
            </label>
            <input
              type="text"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Date *
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warranty Expiry *
            </label>
            <input
              type="date"
              name="warrantyExpiry"
              value={formData.warrantyExpiry}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department *
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Maintenance Team *
            </label>
            <select
              name="assignedTeamId"
              value={formData.assignedTeamId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a team</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name} - {team.specialization}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {equipment ? 'Update Equipment' : 'Add Equipment'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentForm;