import React, { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { dataStore } from '../utils/dataStore';
import KanbanBoard from '../components/KanbanBoard';
import RequestForm from '../components/RequestForm';

const Requests = () => {
  const [requests, setRequests] = useState(dataStore.getRequests());
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    priority: 'all',
    technician: 'all'
  });

  const equipment = dataStore.getEquipment();
  const technicians = dataStore.getTechnicians();

  const filteredRequests = requests.filter(request => {
    if (filters.type !== 'all' && request.type !== filters.type) return false;
    if (filters.priority !== 'all' && request.priority !== filters.priority) return false;
    if (filters.technician !== 'all' && request.assignedTechnicianId !== parseInt(filters.technician)) return false;
    return true;
  });

  const handleAddRequest = () => {
    setEditingRequest(null);
    setShowForm(true);
  };

  const handleSaveRequest = (requestData) => {
    if (editingRequest) {
      dataStore.updateRequest(editingRequest.id, requestData);
    } else {
      dataStore.addRequest(requestData);
    }
    setRequests(dataStore.getRequests());
    setShowForm(false);
    setEditingRequest(null);
  };

  const handleMoveRequest = (requestId, newStatus) => {
    dataStore.updateRequest(requestId, { status: newStatus });
    setRequests(dataStore.getRequests());
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const getRequestStats = () => {
    const stats = {
      total: filteredRequests.length,
      new: filteredRequests.filter(r => r.status === 'New').length,
      inProgress: filteredRequests.filter(r => r.status === 'In Progress').length,
      repaired: filteredRequests.filter(r => r.status === 'Repaired').length,
      scrap: filteredRequests.filter(r => r.status === 'Scrap').length,
    };
    return stats;
  };

  const stats = getRequestStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Requests</h1>
          <p className="text-gray-600">Manage and track maintenance requests with drag-and-drop</p>
        </div>
        <button
          onClick={handleAddRequest}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          New Request
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          <div className="text-sm text-gray-600">New</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.repaired}</div>
          <div className="text-sm text-gray-600">Repaired</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.scrap}</div>
          <div className="text-sm text-gray-600">Scrap</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Types</option>
            <option value="Corrective">Corrective</option>
            <option value="Preventive">Preventive</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={filters.technician}
            onChange={(e) => handleFilterChange('technician', e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Technicians</option>
            {technicians.map(tech => (
              <option key={tech.id} value={tech.id}>{tech.name}</option>
            ))}
          </select>

          {(filters.type !== 'all' || filters.priority !== 'all' || filters.technician !== 'all') && (
            <button
              onClick={() => setFilters({ type: 'all', priority: 'all', technician: 'all' })}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="bg-white rounded-lg shadow p-6">
        <KanbanBoard
          requests={filteredRequests}
          onMoveRequest={handleMoveRequest}
        />
      </div>

      {/* Request Form Modal */}
      {showForm && (
        <RequestForm
          request={editingRequest}
          onSave={handleSaveRequest}
          onCancel={() => {
            setShowForm(false);
            setEditingRequest(null);
          }}
        />
      )}
    </div>
  );
};

export default Requests;