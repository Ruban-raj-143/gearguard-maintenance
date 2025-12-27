import { format, isAfter, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

export const isOverdue = (scheduledDate) => {
  if (!scheduledDate) return false;
  return isAfter(new Date(), parseISO(scheduledDate));
};

export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High':
      return 'text-red-600 bg-red-100';
    case 'Medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'Low':
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'New':
      return 'text-blue-600 bg-blue-100';
    case 'In Progress':
      return 'text-orange-600 bg-orange-100';
    case 'Repaired':
      return 'text-green-600 bg-green-100';
    case 'Scrap':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getHealthScoreColor = (score) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
};

export const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9);
};