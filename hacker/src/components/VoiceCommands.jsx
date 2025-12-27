import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Zap } from 'lucide-react';
import { dataStore } from '../utils/dataStore';

const VoiceCommands = ({ onCommandExecuted }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        setTranscript(command);
        processVoiceCommand(command);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const processVoiceCommand = (command) => {
    const equipment = dataStore.getEquipment();
    const technicians = dataStore.getTechnicians();
    
    // Command patterns
    const patterns = {
      createRequest: /create (breakdown|corrective|preventive) request for (.+)/i,
      closeRequest: /close request (\d+) as (repaired|scrap)/i,
      showEquipment: /show equipment (.+)/i,
      assignTechnician: /assign (.+) to request (\d+)/i,
      checkHealth: /check health of (.+)/i
    };

    let commandExecuted = false;

    // Create request command
    const createMatch = command.match(patterns.createRequest);
    if (createMatch) {
      const [, type, equipmentName] = createMatch;
      const foundEquipment = equipment.find(eq => 
        eq.name.toLowerCase().includes(equipmentName.toLowerCase())
      );
      
      if (foundEquipment) {
        const requestType = type.toLowerCase() === 'preventive' ? 'Preventive' : 'Corrective';
        const newRequest = {
          subject: `Voice command: ${requestType} maintenance for ${foundEquipment.name}`,
          equipmentId: foundEquipment.id,
          type: requestType,
          scheduledDate: new Date().toISOString().split('T')[0],
          duration: 2,
          assignedTechnicianId: dataStore.suggestTechnician(foundEquipment.assignedTeamId)?.id || 1,
          priority: dataStore.calculatePriority(foundEquipment.id, requestType)
        };
        
        dataStore.addRequest(newRequest);
        speak(`Created ${requestType.toLowerCase()} request for ${foundEquipment.name}`);
        commandExecuted = true;
      } else {
        speak(`Equipment ${equipmentName} not found`);
      }
    }

    // Close request command
    const closeMatch = command.match(patterns.closeRequest);
    if (closeMatch) {
      const [, requestId, status] = closeMatch;
      const request = dataStore.getRequests().find(r => r.id === parseInt(requestId));
      
      if (request) {
        const newStatus = status.toLowerCase() === 'scrap' ? 'Scrap' : 'Repaired';
        dataStore.updateRequest(parseInt(requestId), { status: newStatus });
        speak(`Request ${requestId} marked as ${newStatus.toLowerCase()}`);
        commandExecuted = true;
      } else {
        speak(`Request ${requestId} not found`);
      }
    }

    // Show equipment command
    const showMatch = command.match(patterns.showEquipment);
    if (showMatch) {
      const [, equipmentName] = showMatch;
      const foundEquipment = equipment.find(eq => 
        eq.name.toLowerCase().includes(equipmentName.toLowerCase())
      );
      
      if (foundEquipment) {
        speak(`${foundEquipment.name} has health score ${foundEquipment.healthScore}% and is located in ${foundEquipment.location}`);
        commandExecuted = true;
      } else {
        speak(`Equipment ${equipmentName} not found`);
      }
    }

    // Check health command
    const healthMatch = command.match(patterns.checkHealth);
    if (healthMatch) {
      const [, equipmentName] = healthMatch;
      const foundEquipment = equipment.find(eq => 
        eq.name.toLowerCase().includes(equipmentName.toLowerCase())
      );
      
      if (foundEquipment) {
        const healthStatus = foundEquipment.healthScore >= 80 ? 'excellent' :
                           foundEquipment.healthScore >= 60 ? 'good' :
                           foundEquipment.healthScore >= 40 ? 'fair' : 'critical';
        speak(`${foundEquipment.name} health is ${healthStatus} at ${foundEquipment.healthScore}%`);
        commandExecuted = true;
      }
    }

    if (!commandExecuted) {
      speak("Sorry, I didn't understand that command. Try saying 'create breakdown request for CNC machine' or 'close request 123 as repaired'");
    }

    if (onCommandExecuted && commandExecuted) {
      onCommandExecuted();
    }
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognition && !isListening) {
      setTranscript('');
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 text-center">
        <MicOff className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">Voice commands not supported in this browser</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <Volume2 className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Voice Commands</h3>
        <span className="ml-2 text-sm text-gray-500">Hands-free operation</span>
      </div>

      {/* Voice Control Button */}
      <div className="text-center mb-4">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white shadow-lg`}
        >
          {isListening ? (
            <MicOff className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </button>
        <p className="text-sm text-gray-600 mt-2">
          {isListening ? 'Listening...' : 'Click to start voice command'}
        </p>
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>You said:</strong> "{transcript}"
          </p>
        </div>
      )}

      {/* Command Examples */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 flex items-center">
          <Zap className="h-4 w-4 mr-2 text-yellow-600" />
          Voice Command Examples
        </h4>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="p-2 bg-gray-50 rounded">
            "Create breakdown request for CNC machine"
          </div>
          <div className="p-2 bg-gray-50 rounded">
            "Close request 123 as repaired"
          </div>
          <div className="p-2 bg-gray-50 rounded">
            "Check health of hydraulic press"
          </div>
          <div className="p-2 bg-gray-50 rounded">
            "Show equipment server rack"
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>Voice recognition: {isSupported ? 'Enabled' : 'Disabled'}</span>
        <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500' : 'bg-green-500'}`}></div>
      </div>
    </div>
  );
};

export default VoiceCommands;