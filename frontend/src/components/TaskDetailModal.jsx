import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const TaskDetailModal = ({ task, projectId, projectMembers, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  
  // Local state for edits
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split('T')[0] : '');
  const [assigneeId, setAssigneeId] = useState(task.assigneeId || '');

  // Determine permissions
  const myMembership = projectMembers.find(m => m.user.id === user.id);
  const isAdmin = myMembership?.role === 'ADMIN';
  const isAssignee = task.assigneeId === user.id;

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = isAdmin 
        ? { title, description, status, priority, dueDate: dueDate || null, assigneeId: assigneeId || null }
        : { status }; // members can only change status
        
      await api.put(`/api/tasks/${task.id}`, payload);
      onUpdate();
      setEditing(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/api/tasks/${task.id}`);
      onUpdate();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete task');
    }
  };

  const renderField = (label, value, isEditing, editInput) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {isEditing ? editInput : <div className="text-gray-900 bg-gray-50 p-2 rounded border border-transparent">{value || '-'}</div>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-2xl w-full flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-900 truncate pr-4">
            {editing && isAdmin ? (
              <input type="text" className="w-full border p-1 rounded font-normal text-base" value={title} onChange={e => setTitle(e.target.value)} required />
            ) : task.title}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center transition">
            &times;
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow">
          <form id="task-form" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                {renderField('Description', task.description, editing && isAdmin, 
                  <textarea rows="4" className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500" value={description} onChange={e => setDescription(e.target.value)} />
                )}

                {renderField('Status', task.status.replace('_', ' '), editing && (isAdmin || isAssignee),
                  <select className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                )}
              </div>

              <div className="space-y-4">
                {renderField('Priority', task.priority, editing && isAdmin,
                  <select className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500" value={priority} onChange={e => setPriority(e.target.value)}>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                )}

                {renderField('Assignee', task.assignee?.name || 'Unassigned', editing && isAdmin,
                  <select className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                    <option value="">Unassigned</option>
                    {projectMembers.map(m => (
                      <option key={m.user.id} value={m.user.id}>{m.user.name} ({m.user.email})</option>
                    ))}
                  </select>
                )}

                {renderField('Due Date', task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date', editing && isAdmin,
                  <input type="date" className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                )}

                <div className="text-xs text-gray-500 mt-6 pt-4 border-t border-gray-100">
                  <p>Created by: {task.creator?.name}</p>
                  <p>Created at: {new Date(task.createdAt).toLocaleString()}</p>
                  <p>Last updated: {new Date(task.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
          <div>
            {isAdmin && !editing && (
              <button type="button" onClick={handleDelete} className="text-red-600 hover:text-red-800 font-medium text-sm transition">
                Delete Task
              </button>
            )}
          </div>
          <div className="space-x-3">
            {editing ? (
              <>
                <button type="button" onClick={() => setEditing(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" form="task-form" className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 transition">
                  Save Changes
                </button>
              </>
            ) : (
              (isAdmin || isAssignee) && (
                <button type="button" onClick={() => setEditing(true)} className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 transition">
                  Edit Task
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
