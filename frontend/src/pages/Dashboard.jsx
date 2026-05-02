import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const StatusBadge = ({ status }) => {
  const colors = {
    TODO: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    DONE: 'bg-green-100 text-green-800'
  };
  return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status] || colors.TODO}`}>{status.replace('_', ' ')}</span>;
};

const PriorityBadge = ({ priority }) => {
  const colors = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-red-100 text-red-800'
  };
  return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[priority] || colors.MEDIUM}`}>{priority}</span>;
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/api/dashboard');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-gray-500">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="text-red-500 text-center">Failed to load dashboard</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.totalTasks}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100 border-l-4 border-l-gray-400">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">To Do</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.byStatus.TODO}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100 border-l-4 border-l-blue-400">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.byStatus.IN_PROGRESS}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100 border-l-4 border-l-green-400">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Done</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.byStatus.DONE}</dd>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Overdue Tasks */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-100">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6 bg-gray-50 rounded-t-lg">
            <h3 className="text-lg leading-6 font-semibold text-red-600">Overdue Tasks</h3>
          </div>
          <ul className="divide-y divide-gray-100">
            {data.overdueTasks.length === 0 ? (
              <li className="px-6 py-6 text-gray-500 text-sm text-center">No overdue tasks!</li>
            ) : (
              data.overdueTasks.map(task => (
                <li key={task.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">{task.title}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* My Assigned Tasks */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-100">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6 bg-gray-50 rounded-t-lg">
            <h3 className="text-lg leading-6 font-semibold text-gray-900">My Assigned Tasks</h3>
          </div>
          <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {data.myAssignedTasks.length === 0 ? (
              <li className="px-6 py-6 text-gray-500 text-sm text-center">No assigned tasks!</li>
            ) : (
              data.myAssignedTasks.map(task => (
                <li key={task.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">{task.title}</p>
                    <div className="ml-2 flex-shrink-0 flex space-x-2">
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
