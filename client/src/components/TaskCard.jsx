import React, { useState } from 'react';
import API from '../services/api'; // Assuming API is setup for backend calls

const TaskCard = ({ task, onStatusChange, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [updatedTitle, setUpdatedTitle] = useState(task.title);
    const [updatedDescription, setUpdatedDescription] = useState(task.description);
    const [updatedAssignedTo, setUpdatedAssignedTo] = useState(task.assignedTo);

    const handleEdit = async () => {
        try {
          const updatedTask = {
            title: updatedTitle,
            description: updatedDescription,
            assignedTo: updatedAssignedTo,
            status: task.status
          };
          
          const token = localStorage.getItem('token');
          
          if (!token) {
            throw new Error('No token provided');
          }
          
          await API.put(`/tasks/${task._id}`, updatedTask, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          setIsEditing(false);
          
          // Option 1: Call onStatusChange with the same parameters as elsewhere
          if (typeof onStatusChange === 'function') {
            onStatusChange(task._id, task.status);
          }
          
          // OR Option 2: Don't call onStatusChange here at all and refresh the page
          // window.location.reload();
        } catch (error) {
          console.error('Error updating task:', error);
        }
    };
      
      const handleDelete = async () => {
        try {
          const token = localStorage.getItem('token');
        
          if (!token) {
            throw new Error('No token provided');
          }
        
          await API.delete(`/tasks/${task._id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        
          // Check if onDelete is a function before calling it
          if (typeof onDelete === 'function') {
            onDelete(task._id);
          } else {
            // If onDelete is not available, refresh the page or handle it another way
            console.log('Task deleted successfully, but onDelete function not available');
            window.location.reload(); // Optional: refresh the page to show updated task list
          }
        } catch (error) {
          console.error('Error deleting task:', error);
        }
      };

    return (
        <div className="bg-white shadow-lg rounded-lg p-4 mb-4 border border-gray-200">
            <h4 className="text-xl font-semibold text-gray-800 mb-2">
                {isEditing ? (
                    <input
                        type="text"
                        value={updatedTitle}
                        onChange={(e) => setUpdatedTitle(e.target.value)}
                        className="border rounded p-1 w-full"
                    />
                ) : (
                    task.title
                )}
            </h4>

            <p className="text-gray-600 mb-2">
                {isEditing ? (
                    <textarea
                        value={updatedDescription}
                        onChange={(e) => setUpdatedDescription(e.target.value)}
                        className="border rounded p-1 w-full"
                    />
                ) : (
                    task.description
                )}
            </p>

            <small className="text-sm text-gray-500 italic">
                {isEditing ? (
                    <input
                        type="text"
                        value={updatedAssignedTo}
                        onChange={(e) => setUpdatedAssignedTo(e.target.value)}
                        className="border rounded p-1 w-full"
                    />
                ) : (
                    `Assigned to: ${task.assignedTo}`
                )}
            </small>

            <div className="mt-4 flex justify-between items-center">
                <span
                    className={`text-sm font-semibold px-3 py-1 rounded-full ${task.status === 'In Progress' ? 'bg-yellow-400 text-white' : 'bg-green-500 text-white'
                        }`}
                >
                    {task.status}
                </span>

                <div>
                    <button
                        className="ml-4 text-blue-500 hover:underline"
                        onClick={() =>
                            onStatusChange(task._id, task.status === 'In Progress' ? 'Done' : 'In Progress') // Changed task.id to task._id
                        }
                    >
                        Mark as {task.status === 'In Progress' ? 'Done' : 'In Progress'}
                    </button>

                    {isEditing ? (
                        <button
                            className="ml-4 text-green-500 hover:underline"
                            onClick={handleEdit}
                        >
                            Save
                        </button>
                    ) : (
                        <button
                            className="ml-4 text-orange-500 hover:underline"
                            onClick={() => setIsEditing(true)} // Toggle to editing mode
                        >
                            Edit
                        </button>
                    )}

                    <button
                        className="ml-4 text-red-500 hover:underline"
                        onClick={handleDelete}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
