import { useState, useEffect, useContext } from "react"
import axios from '../api/axios';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers"
import AuthContext from "../context/AuthContext"
import TaskCard from "../components/TaskCard"
import SortableTaskCard from "../components/SortableTaskCard"
import TaskForm from "../components/TaskForm"

const Dashboard = () => {
  const { user } = useContext(AuthContext)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require the mouse to move by 10 pixels before activating
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get("/api/tasks")
        setTasks(res.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching tasks:", err)
        setError("Failed to load tasks. Please check your connection and try again.")
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (!over) return

    // Find the containers (status columns)
    const activeContainer = active.data.current?.sortable?.containerId
    const overContainer = over.data.current?.sortable?.containerId || over.id

    if (activeContainer !== overContainer) {
      // Task was moved to a different status column
      const taskId = active.id
      const newStatus = overContainer

      // Find the task
      const task = tasks.find((t) => t._id === taskId)
      if (!task) return

      // Optimistically update the UI
      const updatedTasks = tasks.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      setTasks(updatedTasks)

      // Update the task status in the backend using the moveTask endpoint
      try {
        await axios.patch(`/api/tasks/${taskId}/move`, { status: newStatus })
      } catch (err) {
        console.error("Error updating task status:", err)
        // Revert the UI on error
        setTasks(tasks)
        setError("Failed to update task status. Please try again.")
      }
    }

    setActiveId(null)
  }

  const addTask = async (taskData) => {
    try {
      const res = await axios.post("/api/tasks", taskData)
      setTasks([...tasks, res.data])
      setShowTaskForm(false)
    } catch (err) {
      console.error("Error adding task:", err)
      setError("Failed to add task. Please try again.")
    }
  }

  const updateTask = async (id, taskData) => {
    try {
      const res = await axios.put(`/api/tasks/${id}`, taskData)
      setTasks(tasks.map((task) => (task._id === id ? res.data : task)))
      setEditingTask(null)
      setShowTaskForm(false)
    } catch (err) {
      console.error("Error updating task:", err)
      setError("Failed to update task. Please try again.")
    }
  }

  const deleteTask = async (id) => {
    try {
      // Optimistically update UI first for better user experience
      setTasks(tasks.filter((task) => task._id !== id))

      // Then make the API call
      await axios.delete(`/api/tasks/${id}`)
    } catch (err) {
      console.error("Error deleting task:", err)

      // If there's an error, revert the UI change and show error message
      fetchTasks() // Refresh tasks from server
      setError("Failed to delete task. There might be an issue with the server. Please check the backend logs.")

      // Show more detailed error for debugging
      if (err.response) {
        console.error("Server response:", err.response.data)
      }
    }
  }

  // Function to refresh tasks
  const fetchTasks = async () => {
    try {
      const res = await axios.get("/api/tasks")
      setTasks(res.data)
    } catch (err) {
      console.error("Error refreshing tasks:", err)
    }
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Filter tasks by status
  const todoTasks = tasks.filter((task) => task.status === "To Do")
  const inProgressTasks = tasks.filter((task) => task.status === "In Progress")
  const doneTasks = tasks.filter((task) => task.status === "Done")

  // Find the active task for the drag overlay
  const activeTask = tasks.find((task) => task._id === activeId)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Board</h1>
        <button
          onClick={() => {
            setEditingTask(null)
            setShowTaskForm(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add Task
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {showTaskForm && (
        <TaskForm
          onSubmit={editingTask ? (data) => updateTask(editingTask._id, data) : addTask}
          onCancel={() => {
            setShowTaskForm(false)
            setEditingTask(null)
          }}
          task={editingTask}
        />
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* To Do Column */}
          <div>
            <h2 className="text-lg font-semibold mb-3 bg-gray-100 p-3 rounded-t border-l-4 border-gray-500">To Do</h2>
            <div id="To Do" className="bg-gray-50 p-3 rounded-b min-h-[200px]">
              <SortableContext
                items={todoTasks.map((task) => task._id)}
                strategy={verticalListSortingStrategy}
                id="To Do"
              >
                {todoTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No tasks to do</p>
                ) : (
                  todoTasks.map((task) => (
                    <SortableTaskCard
                      key={task._id}
                      id={task._id}
                      task={task}
                      onEdit={() => handleEditTask(task)}
                      onDelete={() => deleteTask(task._id)}
                    />
                  ))
                )}
              </SortableContext>
            </div>
          </div>

          {/* In Progress Column */}
          <div>
            <h2 className="text-lg font-semibold mb-3 bg-blue-100 p-3 rounded-t border-l-4 border-blue-500">
              In Progress
            </h2>
            <div id="In Progress" className="bg-blue-50 p-3 rounded-b min-h-[200px]">
              <SortableContext
                items={inProgressTasks.map((task) => task._id)}
                strategy={verticalListSortingStrategy}
                id="In Progress"
              >
                {inProgressTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No tasks in progress</p>
                ) : (
                  inProgressTasks.map((task) => (
                    <SortableTaskCard
                      key={task._id}
                      id={task._id}
                      task={task}
                      onEdit={() => handleEditTask(task)}
                      onDelete={() => deleteTask(task._id)}
                    />
                  ))
                )}
              </SortableContext>
            </div>
          </div>

          {/* Done Column */}
          <div>
            <h2 className="text-lg font-semibold mb-3 bg-green-100 p-3 rounded-t border-l-4 border-green-500">Done</h2>
            <div id="Done" className="bg-green-50 p-3 rounded-b min-h-[200px]">
              <SortableContext
                items={doneTasks.map((task) => task._id)}
                strategy={verticalListSortingStrategy}
                id="Done"
              >
                {doneTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No completed tasks</p>
                ) : (
                  doneTasks.map((task) => (
                    <SortableTaskCard
                      key={task._id}
                      id={task._id}
                      task={task}
                      onEdit={() => handleEditTask(task)}
                      onDelete={() => deleteTask(task._id)}
                    />
                  ))
                )}
              </SortableContext>
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeId && activeTask ? (
            <div className="opacity-80">
              <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export default Dashboard
