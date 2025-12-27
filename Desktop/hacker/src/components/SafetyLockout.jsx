import React, { useState } from 'react';
import { Shield, Lock, AlertTriangle, CheckCircle, User, Clock } from 'lucide-react';
import { dataStore } from '../utils/dataStore';

const SafetyLockout = ({ requestId, onLockoutComplete }) => {
  const [lockoutStep, setLockoutStep] = useState(1);
  const [lockoutData, setLockoutData] = useState({
    technicianId: '',
    supervisorId: '',
    powerIsolated: false,
    equipmentLocked: false,
    taggedOut: false,
    safetyChecked: false,
    lockoutTime: null,
    notes: ''
  });

  const technicians = dataStore.getTechnicians();
  const supervisors = technicians.filter(tech => tech.activeRequests <= 1); // Assume less busy techs can supervise

  const handleInputChange = (field, value) => {
    setLockoutData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStepComplete = () => {
    if (lockoutStep < 5) {
      setLockoutStep(lockoutStep + 1);
    } else {
      // Complete lockout process
      const completedLockout = {
        ...lockoutData,
        lockoutTime: new Date().toISOString(),
        completed: true
      };
      
      // In a real system, this would be stored in the database
      localStorage.setItem(`lockout-${requestId}`, JSON.stringify(completedLockout));
      
      if (onLockoutComplete) {
        onLockoutComplete(completedLockout);
      }
    }
  };

  const isStepValid = () => {
    switch (lockoutStep) {
      case 1:
        return lockoutData.technicianId && lockoutData.supervisorId;
      case 2:
        return lockoutData.powerIsolated;
      case 3:
        return lockoutData.equipmentLocked;
      case 4:
        return lockoutData.taggedOut;
      case 5:
        return lockoutData.safetyChecked;
      default:
        return false;
    }
  };

  const steps = [
    {
      id: 1,
      title: 'Personnel Assignment',
      description: 'Assign technician and supervisor for this maintenance task',
      icon: User,
      color: 'text-blue-600'
    },
    {
      id: 2,
      title: 'Power Isolation',
      description: 'Confirm all power sources have been isolated',
      icon: AlertTriangle,
      color: 'text-orange-600'
    },
    {
      id: 3,
      title: 'Equipment Lockout',
      description: 'Apply physical locks to prevent equipment startup',
      icon: Lock,
      color: 'text-red-600'
    },
    {
      id: 4,
      title: 'Tagout Procedure',
      description: 'Attach warning tags with technician information',
      icon: Shield,
      color: 'text-purple-600'
    },
    {
      id: 5,
      title: 'Safety Verification',
      description: 'Final safety check and supervisor approval',
      icon: CheckCircle,
      color: 'text-green-600'
    }
  ];

  const currentStep = steps.find(step => step.id === lockoutStep);
  const Icon = currentStep?.icon || Shield;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Shield className="h-6 w-6 text-red-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Safety Lockout-Tagout</h3>
        <span className="ml-2 text-sm text-gray-500">OSHA Compliant</span>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">Step {lockoutStep} of 5</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-red-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(lockoutStep / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Current Step */}
      <div className="mb-6 p-4 border-2 border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center mb-3">
          <Icon className={`h-6 w-6 mr-3 ${currentStep?.color}`} />
          <h4 className="font-semibold text-gray-900">{currentStep?.title}</h4>
        </div>
        <p className="text-sm text-gray-700 mb-4">{currentStep?.description}</p>

        {/* Step-specific content */}
        {lockoutStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Technician *
              </label>
              <select
                value={lockoutData.technicianId}
                onChange={(e) => handleInputChange('technicianId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select technician</option>
                {technicians.map(tech => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name} - {tech.avatar}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supervising Technician *
              </label>
              <select
                value={lockoutData.supervisorId}
                onChange={(e) => handleInputChange('supervisorId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select supervisor</option>
                {supervisors.map(tech => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name} - {tech.avatar}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {lockoutStep === 2 && (
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="powerIsolated"
                checked={lockoutData.powerIsolated}
                onChange={(e) => handleInputChange('powerIsolated', e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="powerIsolated" className="ml-2 text-sm text-gray-700">
                All electrical power sources have been isolated and verified
              </label>
            </div>
            <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded">
              ⚠️ Verify power isolation using appropriate testing equipment
            </div>
          </div>
        )}

        {lockoutStep === 3 && (
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="equipmentLocked"
                checked={lockoutData.equipmentLocked}
                onChange={(e) => handleInputChange('equipmentLocked', e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="equipmentLocked" className="ml-2 text-sm text-gray-700">
                Physical locks have been applied to all energy isolation points
              </label>
            </div>
            <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded">
              🔒 Use personal locks - each technician must use their own lock
            </div>
          </div>
        )}

        {lockoutStep === 4 && (
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="taggedOut"
                checked={lockoutData.taggedOut}
                onChange={(e) => handleInputChange('taggedOut', e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="taggedOut" className="ml-2 text-sm text-gray-700">
                Warning tags attached with technician name, date, and reason
              </label>
            </div>
            <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded">
              🏷️ Tags must be durable and clearly identify the person responsible
            </div>
          </div>
        )}

        {lockoutStep === 5 && (
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="safetyChecked"
                checked={lockoutData.safetyChecked}
                onChange={(e) => handleInputChange('safetyChecked', e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="safetyChecked" className="ml-2 text-sm text-gray-700">
                Final safety verification completed by supervisor
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Safety Notes
              </label>
              <textarea
                value={lockoutData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Any additional safety considerations or notes..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-1" />
          <span>Started: {new Date().toLocaleTimeString()}</span>
        </div>
        
        <button
          onClick={handleStepComplete}
          disabled={!isStepValid()}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isStepValid()
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {lockoutStep === 5 ? 'Complete Lockout' : 'Next Step'}
        </button>
      </div>

      {/* Safety Reminder */}
      <div className="mt-6 p-3 bg-red-100 border border-red-300 rounded-lg">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-sm font-medium text-red-800">Safety Reminder</span>
        </div>
        <p className="text-xs text-red-700 mt-1">
          Never attempt to start or operate equipment during lockout-tagout procedures. 
          Only the person who applied the lock may remove it.
        </p>
      </div>
    </div>
  );
};

export default SafetyLockout;