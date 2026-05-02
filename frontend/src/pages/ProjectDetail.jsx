import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskDetailModal from '../components/TaskDetailModal';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  // New task form state
  const [newTask, setNewTask] = useState({ title: '', description: '', assigneeId: '', dueDate: '', priority: 'MEDIUM' });

  const fetchData = async () => {
    try {
      const projRes = await api.get(`/api/projects/${id}`);
      setProject(projRes.data);
      const tasksRes = await api.get(`/api/projects/${id}/tasks`);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const myMembership = project?.members?.find(m => m.user.id === user.id);
  const isAdmin = myMembership?.role === 'ADMIN';

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/projects/${id}/members`, { email: newMemberEmail });
      setNewMemberEmail('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await api.delete(`/api/projects/${id}/members/${userId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove member');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newTask };
      if (!payload.assigneeId) delete payload.assigneeId;
      if (!payload.dueDate) delete payload.dueDate;
      
      await api.post(`/api/projects/${id}/tasks`, payload);
      setShowAddTaskModal(false);
      setNewTask({ title: '', description: '', assigneeId: '', dueDate: '', priority: 'MEDIUM' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create task');
    }
  };

  const fetchFullTaskAndOpen = async (taskId) => {
    try {
      const res = await api.get(`/api/tasks/${taskId}`);
      setSelectedTask(res.data);
    } catch (err) {
      alert('Failed to load task details');
    }
  };

  if (loading) return <div className="flex justify-center p-12">Loading project...</div>;
  if (!project) return <div className="text-red-500 text-center">Project not found or access denied</div>;

  const renderKanbanColumn = (status, title, bgColor, borderColor) => {
    const columnTasks = tasks.filter(t => t.status === status);
    return (
      <div className={`flex flex-col bg-gray-50 rounded-lg shadow-sm border-t-4 ${borderColor} h-full`}>
        <div className="p-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-700">{title} <span className="ml-2 text-xs bg-gray-200 text-gray-600 py-1 px-2 rounded-full">{columnTasks.length}</span></h3>
        </div>
        <div className="p-3 flex-1 overflow-y-auto space-y-3">
          {columnTasks.map(task => (
            <div 
              key={task.id} 
              onClick={() => fetchFullTaskAndOpen(task.id)}
              className="bg-white p-4 rounded shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition group"
            >
              <h4 className="font-medium text-gray-900 group-hover:text-indigo-600 transition truncate">{task.title}</h4>
              <div className="mt-3 flex justify-between items-center text-xs">
                <span className={`px-2 py-1 rounded font-medium ${
                  task.priority === 'HIGH' ? 'bg-red-100 text-red-800' : 
                  task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
                {task.assignee && (
                  <div className="flex items-center text-gray-500" title={task.assignee.name}>
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mr-1">
                      {task.assignee.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {columnTasks.length === 0 && (
            <div className="text-sm text-gray-400 text-center p-4 border-2 border-dashed border-gray-200 rounded">No tasks</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-start bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center space-x-3">
            <Link to="/projects" className="text-gray-400 hover:text-indigo-600 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900">{project.name}</h1>
          </div>
          <p className="mt-2 text-gray-600 max-w-2xl">{project.description}</p>
        </div>
        <button 
          onClick={() => setShowAddTaskModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-sm font-medium transition flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Task
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-250px)]">
        {/* Kanban Board */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          {renderKanbanColumn('TODO', 'To Do', 'bg-gray-50', 'border-gray-400')}
          {renderKanbanColumn('IN_PROGRESS', 'In Progress', 'bg-blue-50', 'border-blue-400')}
          {renderKanbanColumn('DONE', 'Done', 'bg-green-50', 'border-green-400')}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900">Team Members ({project.members.length})</h3>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto">
            <ul className="space-y-4">
              {project.members.map(member => (
                <li key={member.id} className="flex justify-between items-center group">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold mr-3">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.user.name} {member.user.id === user.id && '(You)'}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <button 
                      onClick={() => handleRemoveMember(member.user.id)}
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition p-1"
                      title="Remove member"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          {isAdmin && (
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <form onSubmit={handleAddMember} className="flex space-x-2">
                <input 
                  type="email" 
                  placeholder="Invite via email..." 
                  required
                  className="flex-1 min-w-0 border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={newMemberEmail}
                  onChange={e => setNewMemberEmail(e.target.value)}
                />
                <button type="submit" className="bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm hover:bg-gray-700 transition">
                  Add
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Create New Task</h3>
              <button onClick={() => setShowAddTaskModal(false)} className="text-gray-400 hover:text-gray-600 transition">&times;</button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
                  <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assign To</label>
                    <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500" value={newTask.assigneeId} onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}>
                      <option value="">Unassigned</option>
                      {project.members.map(m => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input type="date" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
                <button type="button" onClick={() => setShowAddTaskModal(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          projectId={id}
          projectMembers={project.members}
          onClose={() => setSelectedTask(null)}
          onUpdate={() => {
            fetchData();
            if (selectedTask) fetchFullTaskAndOpen(selectedTask.id);
          }}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
