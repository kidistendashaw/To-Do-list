import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import apiClient from "../services/api";
import { useAuth } from "../context/AuthContext";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

const HomePage = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState(""); // '', 'IN_PROGRESS', 'COMPLETED'
  const [editingTask, setEditingTask] = useState(null); // The task object being edited
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const response = await apiClient.get("/tasks/", { params });
      setTasks(response.data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingTask) {
        // Update existing task
        await apiClient.put(`/tasks/${editingTask.id}`, data);
        setEditingTask(null);
      } else {
        // Create new task
        await apiClient.post("/tasks/", data);
      }
      fetchTasks();
      reset();
    } catch (error) {
      console.error("Failed to save task", error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setValue("title", task.title);
    setValue("deadline", task.deadline);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await apiClient.delete(`/tasks/${taskId}`);
        fetchTasks();
      } catch (error) {
        console.error("Failed to delete task", error);
      }
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await apiClient.put(`/tasks/${task.id}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">To-Do List</h1>
        <div>
          <span className="mr-4">Welcome, {user.username}</span>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="container mx-auto p-4 max-w-3xl">
        {/* Form Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-bold mb-4">
            {editingTask ? "Edit Task" : "Add a New Task"}
          </h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col sm:flex-row gap-4"
          >
            <input
              type="text"
              placeholder="Task title"
              {...register("title", { required: true })}
              className="flex-grow px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              {...register("deadline", { required: true })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />{" "}
              {editingTask ? "Update" : "Add"}
            </button>
            {editingTask && (
              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  reset();
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        {/* Filter Section */}
        <div className="mb-4 flex items-center gap-4">
          <h3 className="font-semibold">Filter by status:</h3>
          <button
            onClick={() => setFilter("")}
            className={`px-4 py-1 rounded-full text-sm ${
              filter === "" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("IN_PROGRESS")}
            className={`px-4 py-1 rounded-full text-sm ${
              filter === "IN_PROGRESS"
                ? "bg-yellow-500 text-white"
                : "bg-gray-200"
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter("COMPLETED")}
            className={`px-4 py-1 rounded-full text-sm ${
              filter === "COMPLETED" ? "bg-green-500 text-white" : "bg-gray-200"
            }`}
          >
            Completed
          </button>
        </div>

        {/* Task List */}
        <div className="bg-white rounded-lg shadow-md">
          <ul className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={task.status === "COMPLETED"}
                    onChange={() =>
                      handleStatusChange(
                        task,
                        task.status === "COMPLETED"
                          ? "IN_PROGRESS"
                          : "COMPLETED"
                      )
                    }
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-4"
                  />
                  <div>
                    <p
                      className={`font-semibold ${
                        task.status === "COMPLETED"
                          ? "line-through text-gray-500"
                          : ""
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      Deadline: {task.deadline}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(task)}
                    className="p-2 text-gray-500 hover:text-blue-600"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 text-gray-500 hover:text-red-600"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
