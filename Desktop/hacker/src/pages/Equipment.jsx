import React, { useState } from 'react';
import { Plus, Edit, Wrench, MapPin, Calendar, QrCode, Brain, DollarSign, Mic, Shield, Leaf } from 'lucide-react';
import { dataStore } from '../utils/dataStore';
import { formatDate, getHealthScoreColor } from '../utils/helpers';
import EquipmentForm from '../components/EquipmentForm';
import SmartInsights from '../components/SmartInsights';
import QRCodeModal from '../components/QRCodeModal';
import VoiceCommands from '../components/VoiceCommands';
import SafetyLockout from '../components/SafetyLockout';
import SustainabilityTracker from '../components/SustainabilityTracker';

const Equipment = () => {
  const [equipment, setEquipment] = useState(dataStore.getEquipment());
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrEquipment, setQrEquipment] = useState(null);
  const [activePanel, setActivePanel] = useState('insights'); // 'insights', 'voice', 'safety', 'sustainability'

  const teams = dataStore.getTeams();
  const requests = dataStore.getRequests();

  const filteredEquipment = equipment.filter(eq =>
    eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEquipment = () => {
    setEditingEquipment(null);
    setShowForm(true);
  };

  const handleEditEquipment = (eq) => {
    setEditingEquipment(eq);
    setShowForm(true);
  };

  const handleSaveEquipment = (equipmentData) => {
    if (editingEquipment) {
      const updated = dataStore.updateEquipment(editingEquipment.id, equipmentData);
      setEquipment(dataStore.getEquipment());
    } else {
      dataStore.addEquipment(equipmentData);
      setEquipment(dataStore.getEquipment());
    }
    setShowForm(false);
    setEditingEquipment(null);
  };

  const handleShowQR = (eq) => {
    setQrEquipment(eq);
    setShowQRModal(true);
  };

  const handleShowInsights = (eq) => {
    setSelectedEquipment(eq);
    setActivePanel('insights');
  };

  const handleVoiceCommandExecuted = () => {
    // Refresh data after voice command
    setEquipment(dataStore.getEquipment());
  };

  const getOpenRequestsCount = (equipmentId) => {
    return requests.filter(r => 
      r.equipmentId === equipmentId && 
      (r.status === 'New' || r.status === 'In Progress')
    ).length;
  };

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown';
  };

  const isWarrantyExpired = (warrantyDate) => {
    return new Date(warrantyDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipment Management</h1>
          <p className="text-gray-600">Manage your company equipment and track their health</p>
        </div>
        <button
          onClick={handleAddEquipment}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Equipment
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <input
          type="text"
          placeholder="Search equipment by name, location, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Equipment Cards */}
        <div className="lg:col-span-2 xl:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEquipment.map(eq => {
              const openRequests = getOpenRequestsCount(eq.id);
              const warrantyExpired = isWarrantyExpired(eq.warrantyExpiry);
              
              return (
                <div key={eq.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{eq.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleShowQR(eq)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Generate QR Code"
                        >
                          <QrCode className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditEquipment(eq)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Serial: {eq.serialNumber}</p>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Health Score */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Health Score</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className={`h-2 rounded-full ${
                              eq.healthScore >= 80 ? 'bg-green-500' :
                              eq.healthScore >= 60 ? 'bg-yellow-500' :
                              eq.healthScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${eq.healthScore}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-semibold ${getHealthScoreColor(eq.healthScore)}`}>
                          {eq.healthScore}%
                        </span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{eq.location} - {eq.department}</span>
                    </div>

                    {/* Warranty */}
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className={warrantyExpired ? 'text-red-600' : 'text-gray-600'}>
                        Warranty: {formatDate(eq.warrantyExpiry)}
                        {warrantyExpired && ' (Expired)'}
                      </span>
                    </div>

                    {/* Team */}
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Team:</span> {getTeamName(eq.assignedTeamId)}
                    </div>

                    {/* Status and Actions */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        eq.isUsable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {eq.isUsable ? 'Operational' : 'Out of Service'}
                      </span>
                      
                      {/* Maintenance Button */}
                      <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">
                        <Wrench className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">{openRequests}</span>
                        <span className="text-xs ml-1">requests</span>
                      </div>
                    </div>

                    {/* Smart Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => handleShowInsights(eq)}
                        className="bg-purple-50 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-100 flex items-center justify-center gap-2 text-sm"
                      >
                        <Brain className="h-4 w-4" />
                        AI Insights
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEquipment(eq);
                          setActivePanel('sustainability');
                        }}
                        className="bg-green-50 text-green-700 px-3 py-2 rounded-lg hover:bg-green-100 flex items-center justify-center gap-2 text-sm"
                      >
                        <Leaf className="h-4 w-4" />
                        Eco Impact
                      </button>
                    </div>

                    {/* Warnings */}
                    {(eq.healthScore < 40 || warrantyExpired) && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                        <p className="text-xs text-yellow-800">
                          {eq.healthScore < 40 && 'Low health score - needs attention. '}
                          {warrantyExpired && 'Warranty expired - consider replacement.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Smart Features Panel */}
        <div className="lg:col-span-2 xl:col-span-1">
          {selectedEquipment ? (
            <div className="space-y-4">
              {/* Panel Selector */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActivePanel('insights')}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activePanel === 'insights'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Brain className="h-4 w-4" />
                    AI Insights
                  </button>
                  <button
                    onClick={() => setActivePanel('sustainability')}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activePanel === 'sustainability'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Leaf className="h-4 w-4" />
                    Sustainability
                  </button>
                  <button
                    onClick={() => setActivePanel('voice')}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activePanel === 'voice'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Mic className="h-4 w-4" />
                    Voice Control
                  </button>
                  <button
                    onClick={() => setActivePanel('safety')}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activePanel === 'safety'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    Safety
                  </button>
                </div>
              </div>

              {/* Active Panel Content */}
              {activePanel === 'insights' && (
                <SmartInsights 
                  equipmentId={selectedEquipment.id} 
                  equipment={selectedEquipment}
                />
              )}
              
              {activePanel === 'sustainability' && (
                <SustainabilityTracker
                  equipmentId={selectedEquipment.id}
                  equipment={selectedEquipment}
                />
              )}
              
              {activePanel === 'voice' && (
                <VoiceCommands onCommandExecuted={handleVoiceCommandExecuted} />
              )}
              
              {activePanel === 'safety' && (
                <SafetyLockout
                  requestId={1} // In real app, this would be the active request ID
                  onLockoutComplete={(lockout) => {
                    console.log('Lockout completed:', lockout);
                  }}
                />
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Features</h3>
              <p className="text-gray-600">
                Select any equipment to access AI insights, sustainability tracking, 
                voice commands, and safety protocols.
              </p>
            </div>
          )}
        </div>
      </div>

      {filteredEquipment.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No equipment found matching your search.</p>
        </div>
      )}

      {/* Equipment Form Modal */}
      {showForm && (
        <EquipmentForm
          equipment={editingEquipment}
          onSave={handleSaveEquipment}
          onCancel={() => {
            setShowForm(false);
            setEditingEquipment(null);
          }}
        />
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <QRCodeModal
          equipment={qrEquipment}
          onClose={() => {
            setShowQRModal(false);
            setQrEquipment(null);
          }}
        />
      )}
    </div>
  );
};

export default Equipment;