import React from 'react';
import { useDrop } from 'react-dnd';
import KanbanCard from './KanbanCard';

const KanbanColumn = ({ title, status, requests, onMoveRequest }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'request',
    drop: (item) => {
      if (item.status !== status) {
        onMoveRequest(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const statusCounts = {
    'New': requests.filter(r => r.status === 'New').length,
    'In Progress': requests.filter(r => r.status === 'In Progress').length,
    'Repaired': requests.filter(r => r.status === 'Repaired').length,
    'Scrap': requests.filter(r => r.status === 'Scrap').length,
  };

  return (
    <div
      ref={drop}
      className={`flex-1 bg-gray-100 rounded-lg p-4 min-h-96 ${
        isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
          {statusCounts[status] || 0}
        </span>
      </div>
      
      <div className="space-y-3">
        {requests
          .filter(request => request.status === status)
          .map(request => (
            <KanbanCard key={request.id} request={request} />
          ))}
      </div>
    </div>
  );
};

const KanbanBoard = ({ requests, onMoveRequest }) => {
  const columns = [
    { title: 'New', status: 'New' },
    { title: 'In Progress', status: 'In Progress' },
    { title: 'Repaired', status: 'Repaired' },
    { title: 'Scrap', status: 'Scrap' },
  ];

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {columns.map(column => (
        <KanbanColumn
          key={column.status}
          title={column.title}
          status={column.status}
          requests={requests}
          onMoveRequest={onMoveRequest}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;