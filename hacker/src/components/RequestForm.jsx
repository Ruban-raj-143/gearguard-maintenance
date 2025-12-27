import React, { useState, useEffect } from 'react';
import { X, Award } from 'lucide-react';
import { dataStore } from '../utils/dataStore';
import { SkillMatcher } from '../utils/smartFeatures';

const RequestForm = ({ request, onSave, onCancel, preselectedEquipment = null, preselectedDate = null }) => {
  const [formData, setFormData] = useState({
    subject: request?.subject || '',
    equipmentId: request?.equipmentId || preselectedEquipment || '',
    type: request?.type || 'Corrective',
    scheduledDate: request?.scheduledDate || preselectedDate || '',
    duration: request?.duration || '',
    assignedTechnicianId: request?.assignedTechnicianId || '',
    priority: request?.priority || 'Medium',
  });

  const [availableTechnicians, setAvailableTechnicians] = useState([]);
  const equipment = dataStore.getEquipment();
  const teams = dataStore.getTeams();

  useEffect(() => {
    if (formData.equipmentId) {
      const selectedEquipment = equipment.find(eq => eq.id === parseInt(formData.equipmentId));
      if (selectedEquipment) {
        const teamTechnicians = dataStore.getTechniciansByTeam(selectedEquipment.assignedTeamId);
        setAvailableTechnicians(teamTechnicians);
        
        // Smart technician suggestion using skill matching
        const bestMatch = SkillMatcher.findBestTechnician(selectedEquipment.id, selectedEquipment.assignedTeamId);
        if (bestMatch && !formData.assignedTechnicianId) {
          setFormData(prev => ({
            ...prev,
            assignedTechnicianId: bestMatch.id
          }));
        }

        // Auto-calculate priority
        const calculatedPriority = dataStore.calculatePriority(selectedEquipment.id, formData.type);
        setFormData(prev => ({
          ...prev,
          priority: calculatedPriority
        }));
      }
    }
  }, [formData.equipmentId, formData.type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      equipmentId: parseInt(formData.equipmentId),
      assignedTechnicianId: parseInt(formData.assignedTechnicianId),
      duration: parseFloat(formData.duration) || 0,
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
            {request ? 'Edit Request' : 'Create Maintenance Request'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="Brief description of the maintenance needed"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Equipment *
            </label>
            <select
              name="equipmentId"
              value={formData.equipmentId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select equipment</option>
              {equipment.filter(eq => eq.isUsable).map(eq => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} - {eq.location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Request Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="Corrective">Corrective (Breakdown)</option>
              <option value="Preventive">Preventive (Routine Check)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scheduled Date *
            </label>
            <input
              type="date"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (hours)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              step="0.5"
              min="0"
              placeholder="Estimated duration"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Technician *
            </label>
            <select
              name="assignedTechnicianId"
              value={formData.assignedTechnicianId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select technician</option>
              {availableTechnicians.map(tech => {
                const selectedEquipment = equipment.find(eq => eq.id === parseInt(formData.equipmentId));
                const skillMatch = selectedEquipment ? 
                  SkillMatcher.findBestTechnician(selectedEquipment.id, selectedEquipment.assignedTeamId) : null;
                const isBestMatch = skillMatch && skillMatch.id === tech.id;
                
                return (
                  <option key={tech.id} value={tech.id}>
                    {tech.name} ({tech.activeRequests} active requests)
                    {isBestMatch ? ' ⭐ Best Match' : ''}
                  </option>
                );
              })}
            </select>
            {formData.equipmentId && formData.assignedTechnicianId && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                <div className="flex items-center">
                  <Award className="h-3 w-3 mr-1" />
                  Smart matching based on skills and workload
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Priority is automatically calculated based on equipment health and warranty status
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {request ? 'Update Request' : 'Create Request'}
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

export default RequestForm;