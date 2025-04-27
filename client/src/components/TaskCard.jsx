import React, { useState } from 'react';
import API from '../services/api';

const TaskCard = ({ task, onStatusChange, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [updatedTitle, setUpdatedTitle] = useState(task.title);
    const [updatedDescription, setUpdatedDescription] = useState(task.description);
    const [updatedAssignedTo, setUpdatedAssignedTo] = useState(task.assignedTo);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleEdit = async () => {
        setIsLoading(true);
        setError(null);
        
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
            
            const response = await API.put(`/tasks/${task._id}`, updatedTask, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Task updated successfully:', response.data);
            setIsEditing(false);
            
            // Check if onStatusChange is a function before calling it
            if (typeof onStatusChange === 'function') {
                onStatusChange(task._id, task.status);
            } else {
                // If onStatusChange is not available, refresh the page
                console.log('Task updated successfully, but onStatusChange function not available');
                window.location.reload();
            }
        } catch (error) {
            console.error('Error updating task:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            setError('Failed to update task. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDelete = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // Make sure this line is present and working
            const token = localStorage.getItem('token');
            
            // Add a check to ensure token exists
            if (!token) {
                setError('Authentication token not found. Please log in again.');
                console.error('Token not found in localStorage');
                return; // Exit the function early
            }
            
            console.log('Token retrieved successfully:', token.substring(0, 10) + '...');
            
            // Now use the token in your API call
            const response = await API.delete(`/tasks/${task._id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Delete response:', response);
            
            if (typeof onDelete === 'function') {
                onDelete(task._id);
            } else {
                window.location.reload();
            }
        } catch (error) {
            console.error('Delete error details:', error);
            setError('Failed to delete task. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    const handleStatusChange = () => {
        const newStatus = task.status === 'In Progress' ? 'Done' : 'In Progress';
        
        // Check if onStatusChange is a function before calling it
        if (typeof onStatusChange === 'function') {
            onStatusChange(task._id, newStatus);
        } else {
            console.log('Cannot change status: onStatusChange function not available');
            // You could show an error message to the user here
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-4 mb-4 border border-gray-200">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            
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
                    className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        task.status === 'In Progress' ? 'bg-yellow-400 text-white' : 'bg-green-500 text-white'
                    }`}
                >
                    {task.status}
                </span>

                <div>
                    <button
                        className="ml-4 text-blue-500 hover:underline"
                        onClick={handleStatusChange}
                        disabled={isLoading}
                    >
                        Mark as {task.status === 'In Progress' ? 'Done' : 'In Progress'}
                    </button>

                    {isEditing ? (
                        <button
                            className="ml-4 text-green-500 hover:underline"
                            onClick={handleEdit}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    ) : (
                        <button
                            className="ml-4 text-orange-500 hover:underline"
                            onClick={() => setIsEditing(true)}
                            disabled={isLoading}
                        >
                            Edit
                        </button>
                    )}

                    <button
                        className="ml-4 text-red-500 hover:underline"
                        onClick={handleDelete}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Add default props to handle cases where functions aren't passed
TaskCard.defaultProps = {
    onStatusChange: null,
    onDelete: null
};

export default TaskCard;