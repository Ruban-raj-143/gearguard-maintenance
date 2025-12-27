import React, { useState } from 'react';
import { Users, User, Wrench, Activity, Award } from 'lucide-react';
import { dataStore } from '../utils/dataStore';
import TechnicianSkills from '../components/TechnicianSkills';

const Teams = () => {
  const [teams] = useState(dataStore.getTeams());
  const [technicians] = useState(dataStore.getTechnicians());
  const [requests] = useState(dataStore.getRequests());
  const [equipment] = useState(dataStore.getEquipment());
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'skills'

  const getTeamTechnicians = (teamId) => {
    return technicians.filter(tech => tech.teamId === teamId);
  };

  const getTeamEquipment = (teamId) => {
    return equipment.filter(eq => eq.assignedTeamId === teamId);
  };

  const getTeamActiveRequests = (teamId) => {
    const teamEquipmentIds = getTeamEquipment(teamId).map(eq => eq.id);
    return requests.filter(req => 
      teamEquipmentIds.includes(req.equipmentId) && 
      (req.status === 'New' || req.status === 'In Progress')
    );
  };

  const getTechnicianRequests = (technicianId) => {
    return requests.filter(req => 
      req.assignedTechnicianId === technicianId && 
      (req.status === 'New' || req.status === 'In Progress')
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams & Technicians</h1>
          <p className="text-gray-600">Manage maintenance teams and track technician workloads with skill matching</p>
        </div>
        
        {/* View Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'overview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Team Overview
          </button>
          <button
            onClick={() => setViewMode('skills')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'skills'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Award className="h-4 w-4 mr-2 inline" />
            Skills Matrix
          </button>
        </div>
      </div>

      {viewMode === 'overview' ? (
        <>
          {/* Teams Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {teams.map(team => {
              const teamTechnicians = getTeamTechnicians(team.id);
              const teamEquipment = getTeamEquipment(team.id);
              const activeRequests = getTeamActiveRequests(team.id);

              return (
                <div key={team.id} className="bg-white rounded-lg shadow">
                  {/* Team Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center mb-2">
                      <Users className="h-6 w-6 text-primary-600 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{team.specialization}</p>
                  </div>

                  {/* Team Stats */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{teamTechnicians.length}</div>
                        <div className="text-xs text-gray-600">Technicians</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{teamEquipment.length}</div>
                        <div className="text-xs text-gray-600">Equipment</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">{activeRequests.length}</div>
                        <div className="text-xs text-gray-600">Active Tasks</div>
                      </div>
                    </div>
                  </div>

                  {/* Technicians List */}
                  <div className="p-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Team Members</h4>
                    {teamTechnicians.length > 0 ? (
                      <div className="space-y-3">
                        {teamTechnicians.map(technician => {
                          const techRequests = getTechnicianRequests(technician.id);
                          const workload = techRequests.length;
                          
                          return (
                            <div key={technician.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center">
                                <div className="text-2xl mr-3">{technician.avatar}</div>
                                <div>
                                  <div className="font-medium text-gray-900">{technician.name}</div>
                                  <div className="text-sm text-gray-600">
                                    {workload} active request{workload !== 1 ? 's' : ''}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Workload Indicator */}
                              <div className="flex items-center">
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  workload === 0 ? 'bg-green-100 text-green-700' :
                                  workload <= 2 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {workload === 0 ? 'Available' :
                                   workload <= 2 ? 'Busy' : 'Overloaded'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No technicians assigned</p>
                    )}
                  </div>

                  {/* Equipment Summary */}
                  <div className="p-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Assigned Equipment</h4>
                    {teamEquipment.length > 0 ? (
                      <div className="space-y-2">
                        {teamEquipment.slice(0, 3).map(eq => (
                          <div key={eq.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-900">{eq.name}</span>
                            <span className="text-gray-600">{eq.location}</span>
                          </div>
                        ))}
                        {teamEquipment.length > 3 && (
                          <div className="text-sm text-gray-500 text-center">
                            +{teamEquipment.length - 3} more equipment
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-2">No equipment assigned</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overall Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Team Performance</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{technicians.length}</div>
                <div className="text-sm text-gray-600">Total Technicians</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {technicians.filter(tech => tech.activeRequests === 0).length}
                </div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {technicians.filter(tech => tech.activeRequests > 0 && tech.activeRequests <= 2).length}
                </div>
                <div className="text-sm text-gray-600">Busy</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {technicians.filter(tech => tech.activeRequests > 2).length}
                </div>
                <div className="text-sm text-gray-600">Overloaded</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Skills Matrix View */
        <div className="space-y-6">
          {/* Team Selector */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Team to View Skills</h3>
            <div className="flex gap-4">
              {teams.map(team => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTeam === team.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {team.name}
                </button>
              ))}
            </div>
          </div>

          {/* Skills Grid */}
          {selectedTeam && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getTeamTechnicians(selectedTeam).map(technician => (
                <TechnicianSkills
                  key={technician.id}
                  technician={technician}
                />
              ))}
            </div>
          )}

          {!selectedTeam && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Skills Matrix</h3>
              <p className="text-gray-600">
                Select a team above to view technician skills and expertise levels.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Teams;