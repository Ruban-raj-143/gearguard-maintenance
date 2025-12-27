import React from 'react';
import { useDrag } from 'react-dnd';
import { Clock, AlertCircle, User } from 'lucide-react';
import { dataStore } from '../utils/dataStore';
import { formatDate, isOverdue, getPriorityColor } from '../utils/helpers';

const KanbanCard = ({ request }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'request',
    item: { id: request.id, status: request.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const equipment = dataStore.getEquipment().find(eq => eq.id === request.equipmentId);
  const technician = dataStore.getTechnicians().find(tech => tech.id === request.assignedTechnicianId);
  const overdue = isOverdue(request.scheduledDate);

  return (
    <div
      ref={drag}
      className={`kanban-card priority-${request.priority.toLowerCase()} ${
        overdue ? 'overdue' : ''
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Priority Badge */}
      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
          {request.priority}
        </span>
        {overdue && (
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span className="text-xs">Overdue</span>
          </div>
        )}
      </div>

      {/* Request Title */}
      <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
        {request.subject}
      </h4>

      {/* Equipment Info */}
      <div className="text-sm text-gray-600 mb-2">
        <div className="font-medium">{equipment?.name || 'Unknown Equipment'}</div>
        <div className="text-xs">{equipment?.location}</div>
      </div>

      {/* Request Type */}
      <div className="mb-2">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          request.type === 'Corrective' 
            ? 'bg-red-100 text-red-700' 
            : 'bg-blue-100 text-blue-700'
        }`}>
          {request.type}
        </span>
      </div>

      {/* Scheduled Date */}
      {request.scheduledDate && (
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <Clock className="h-4 w-4 mr-1" />
          <span>{formatDate(request.scheduledDate)}</span>
        </div>
      )}

      {/* Assigned Technician */}
      {technician && (
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-1" />
            <span>{technician.name}</span>
          </div>
          <div className="text-2xl">
            {technician.avatar}
          </div>
        </div>
      )}

      {/* Duration */}
      {request.duration && (
        <div className="text-xs text-gray-500 mt-2">
          Duration: {request.duration} hours
        </div>
      )}
    </div>
  );
};

export default KanbanCard;