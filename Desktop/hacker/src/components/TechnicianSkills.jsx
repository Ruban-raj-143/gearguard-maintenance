import React from 'react';
import { User, Award, Zap } from 'lucide-react';
import { SkillMatcher } from '../utils/smartFeatures';

const TechnicianSkills = ({ technician, equipmentId = null }) => {
  const allSkills = SkillMatcher.getTechnicianSkills();
  const techSkills = allSkills[technician.id] || [];
  
  let skillMatch = null;
  if (equipmentId) {
    skillMatch = SkillMatcher.findBestTechnician(equipmentId, technician.teamId);
  }

  const skillCategories = {
    'mechanical': { label: 'Mechanical', color: 'bg-blue-100 text-blue-800' },
    'electrical': { label: 'Electrical', color: 'bg-yellow-100 text-yellow-800' },
    'hydraulics': { label: 'Hydraulics', color: 'bg-purple-100 text-purple-800' },
    'pneumatics': { label: 'Pneumatics', color: 'bg-indigo-100 text-indigo-800' },
    'networking': { label: 'Networking', color: 'bg-green-100 text-green-800' },
    'software': { label: 'Software', color: 'bg-cyan-100 text-cyan-800' },
    'hardware': { label: 'Hardware', color: 'bg-gray-100 text-gray-800' },
    'welding': { label: 'Welding', color: 'bg-red-100 text-red-800' },
    'plc': { label: 'PLC Programming', color: 'bg-orange-100 text-orange-800' },
    'calibration': { label: 'Calibration', color: 'bg-pink-100 text-pink-800' },
    'fabrication': { label: 'Fabrication', color: 'bg-teal-100 text-teal-800' },
    'instrumentation': { label: 'Instrumentation', color: 'bg-lime-100 text-lime-800' },
    'motor_repair': { label: 'Motor Repair', color: 'bg-amber-100 text-amber-800' },
    'database': { label: 'Database', color: 'bg-emerald-100 text-emerald-800' },
    'security': { label: 'Security', color: 'bg-rose-100 text-rose-800' },
    'quality_control': { label: 'Quality Control', color: 'bg-violet-100 text-violet-800' },
    'automation': { label: 'Automation', color: 'bg-sky-100 text-sky-800' },
    'robotics': { label: 'Robotics', color: 'bg-fuchsia-100 text-fuchsia-800' },
    'cnc_programming': { label: 'CNC Programming', color: 'bg-slate-100 text-slate-800' },
    'cybersecurity': { label: 'Cybersecurity', color: 'bg-red-200 text-red-900' },
    'power_systems': { label: 'Power Systems', color: 'bg-yellow-200 text-yellow-900' },
    'renewable_energy': { label: 'Renewable Energy', color: 'bg-green-200 text-green-900' },
    'ai_ml': { label: 'AI/ML', color: 'bg-purple-200 text-purple-900' },
    'data_analytics': { label: 'Data Analytics', color: 'bg-blue-200 text-blue-900' },
    'cloud_systems': { label: 'Cloud Systems', color: 'bg-cyan-200 text-cyan-900' },
    'heavy_machinery': { label: 'Heavy Machinery', color: 'bg-gray-200 text-gray-800' },
    'diesel_engines': { label: 'Diesel Engines', color: 'bg-orange-200 text-orange-900' },
    'high_voltage': { label: 'High Voltage', color: 'bg-yellow-300 text-yellow-900' },
    'transformers': { label: 'Transformers', color: 'bg-indigo-200 text-indigo-900' },
    'system_administration': { label: 'System Admin', color: 'bg-gray-200 text-gray-900' },
    'virtualization': { label: 'Virtualization', color: 'bg-blue-300 text-blue-900' },
    'conveyor_systems': { label: 'Conveyor Systems', color: 'bg-green-300 text-green-900' },
    'packaging': { label: 'Packaging', color: 'bg-amber-200 text-amber-800' },
    'hvac': { label: 'HVAC', color: 'bg-teal-200 text-teal-900' },
    'refrigeration': { label: 'Refrigeration', color: 'bg-cyan-300 text-cyan-900' },
    'building_automation': { label: 'Building Automation', color: 'bg-purple-300 text-purple-900' },
    'firewall_management': { label: 'Firewall Management', color: 'bg-red-300 text-red-900' },
    'penetration_testing': { label: 'Penetration Testing', color: 'bg-gray-300 text-gray-900' }
  };

  const getWorkloadStatus = (activeRequests) => {
    if (activeRequests === 0) return { label: 'Available', color: 'bg-green-100 text-green-800' };
    if (activeRequests <= 2) return { label: 'Busy', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Overloaded', color: 'bg-red-100 text-red-800' };
  };

  const workloadStatus = getWorkloadStatus(technician.activeRequests);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Technician Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="text-3xl mr-3">{technician.avatar}</div>
          <div>
            <h3 className="font-semibold text-gray-900">{technician.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${workloadStatus.color}`}>
                {workloadStatus.label}
              </span>
              <span className="text-xs text-gray-500">
                {technician.activeRequests} active requests
              </span>
            </div>
          </div>
        </div>
        
        {skillMatch && skillMatch.id === technician.id && (
          <div className="flex items-center text-green-600">
            <Award className="h-5 w-5 mr-1" />
            <span className="text-sm font-medium">Best Match</span>
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <Zap className="h-4 w-4 text-purple-600 mr-2" />
          <h4 className="text-sm font-medium text-gray-700">Skills & Expertise</h4>
        </div>
        
        {techSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {techSkills.map(skill => {
              const skillInfo = skillCategories[skill] || { 
                label: skill, 
                color: 'bg-gray-100 text-gray-800' 
              };
              
              const isMatched = skillMatch && skillMatch.matchedSkills && 
                skillMatch.matchedSkills.includes(skill);
              
              return (
                <span
                  key={skill}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${skillInfo.color} ${
                    isMatched ? 'ring-2 ring-green-400' : ''
                  }`}
                  title={isMatched ? 'Required for this equipment' : ''}
                >
                  {skillInfo.label}
                  {isMatched && ' ✓'}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No specific skills recorded</p>
        )}
      </div>

      {/* Skill Match Score (if equipment is selected) */}
      {skillMatch && skillMatch.id === technician.id && (
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-900">Match Score</span>
            <span className="text-lg font-bold text-green-600">
              {Math.round(skillMatch.totalScore)}%
            </span>
          </div>
          <div className="text-xs text-green-700 space-y-1">
            <div>Skill Match: {Math.round(skillMatch.skillScore)}%</div>
            <div>Availability: {Math.round(skillMatch.workloadScore)}%</div>
            {skillMatch.matchedSkills.length > 0 && (
              <div>Matched Skills: {skillMatch.matchedSkills.join(', ')}</div>
            )}
          </div>
        </div>
      )}

      {/* Performance Indicators */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-blue-600">
              {Math.max(0, 10 - technician.activeRequests)}
            </div>
            <div className="text-xs text-gray-600">Capacity</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {techSkills.length}
            </div>
            <div className="text-xs text-gray-600">Skills</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-purple-600">
              {technician.activeRequests === 0 ? '100' : 
               technician.activeRequests <= 2 ? '75' : '25'}%
            </div>
            <div className="text-xs text-gray-600">Efficiency</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianSkills;