import React, { useState, useMemo } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { dataStore } from '../utils/dataStore';
import RequestForm from '../components/RequestForm';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';

const Calendar = () => {
  const [requests, setRequests] = useState(dataStore.getRequests());
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const equipment = dataStore.getEquipment();

  // Get preventive maintenance requests for the current month
  const monthlyRequests = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    return requests.filter(request => {
      if (!request.scheduledDate || request.type !== 'Preventive') return false;
      const requestDate = new Date(request.scheduledDate);
      return requestDate >= monthStart && requestDate <= monthEnd;
    });
  }, [requests, currentMonth]);

  // Get calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [currentMonth]);

  const getRequestsForDate = (date) => {
    return monthlyRequests.filter(request => 
      isSameDay(new Date(request.scheduledDate), date)
    );
  };

  const handleDateClick = (date) => {
    setSelectedDate(date.toISOString().split('T')[0]);
    setShowForm(true);
  };

  const handleSaveRequest = (requestData) => {
    dataStore.addRequest({
      ...requestData,
      type: 'Preventive' // Calendar is primarily for preventive maintenance
    });
    setRequests(dataStore.getRequests());
    setShowForm(false);
    setSelectedDate(null);
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      setCurrentMonth(subMonths(currentMonth, 1));
    } else {
      setCurrentMonth(addMonths(currentMonth, 1));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Calendar</h1>
          <p className="text-gray-600">Schedule and view preventive maintenance tasks</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Schedule Maintenance
        </button>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Priority Legend:</h3>
        <div className="flex gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-600 rounded mr-2"></div>
            <span className="text-sm text-gray-600">High Priority</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-600 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Medium Priority</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-600 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Low Priority</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <h2 className="text-xl font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(date => {
              const dayRequests = getRequestsForDate(date);
              const isToday = isSameDay(date, new Date());
              
              return (
                <div
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={`min-h-24 p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    isToday ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {format(date, 'd')}
                  </div>
                  
                  {/* Requests for this date */}
                  <div className="space-y-1">
                    {dayRequests.slice(0, 2).map(request => {
                      const eq = equipment.find(e => e.id === request.equipmentId);
                      const priorityColor = 
                        request.priority === 'High' ? 'bg-red-500' :
                        request.priority === 'Medium' ? 'bg-orange-500' : 'bg-green-500';
                      
                      return (
                        <div
                          key={request.id}
                          className={`text-xs p-1 rounded text-white truncate ${priorityColor}`}
                          title={`${request.subject} - ${eq?.name}`}
                        >
                          {request.subject}
                        </div>
                      );
                    })}
                    {dayRequests.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayRequests.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-1">How to use the calendar:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Click on any date to schedule a new preventive maintenance task</li>
          <li>• Use the arrow buttons to navigate between months</li>
          <li>• Tasks are color-coded by priority level</li>
          <li>• Today's date is highlighted in blue</li>
        </ul>
      </div>

      {/* Request Form Modal */}
      {showForm && (
        <RequestForm
          onSave={handleSaveRequest}
          onCancel={() => {
            setShowForm(false);
            setSelectedDate(null);
          }}
          preselectedDate={selectedDate}
        />
      )}
    </div>
  );
};

export default Calendar;