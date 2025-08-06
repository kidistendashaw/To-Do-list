import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import apiClient from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

const HomePage = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [filter, user]);

  const fetchTasks = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const response = await apiClient.get("/tasks/", { params });
      setTasks(
        response.data.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        )
      );
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingTask) {
        await apiClient.put(`/tasks/${editingTask.id}`, data);
      } else {
        await apiClient.post("/tasks/", data);
      }
      setEditingTask(null);
      reset();
      fetchTasks();
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
        // This is the line that has been corrected.
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

  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
  };

  const getFirstName = () => {
    // =========================================================================
    // === LET'S SEE THE EVIDENCE RIGHT BEFORE WE USE IT ===
    console.log("Inside getFirstName. The full 'user' object is:", user);
    if (user) {
      console.log("The 'user.username' property is:", user.username);
    }
    // =========================================================================

    if (!user || !user.username) {
      // This is the line that is being triggered. Let's find out why.
      return "User";
    }

    const email = user.username;
    const firstPart = email.split("@")[0];
    return firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 text-white font-sans">
      <nav className="p-4 flex justify-between items-center container mx-auto border-b border-white/10">
        <h1 className="text-2xl font-bold tracking-wider">To-Do List</h1>
        <div className="flex items-center gap-4">
          <span className="text-slate-300 hidden sm:block">
            Welcome, {getFirstName()}
          </span>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center justify-center gap-2 bg-red-600/80 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 font-semibold transform hover:scale-105 disabled:opacity-70 disabled:scale-100"
          >
            {isLoggingOut ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </nav>

      <main className="container mx-auto p-4 max-w-3xl">
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/10">
          <h2 className="text-2xl font-semibold mb-4 text-slate-100">
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
              className="flex-grow px-4 py-2 bg-slate-700/50 rounded-lg border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <input
              type="date"
              {...register("deadline", { required: true })}
              className="px-4 py-2 bg-slate-700/50 rounded-lg border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2 font-semibold transform hover:scale-105"
            >
              <PlusIcon className="h-5 w-5" /> {editingTask ? "Update" : "Add"}
            </button>
            {editingTask && (
              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  reset();
                }}
                className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-4 mb-4">
            <h3 className="font-semibold text-slate-300">Filter by:</h3>
            <button
              onClick={() => setFilter("")}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${
                filter === ""
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("IN_PROGRESS")}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${
                filter === "IN_PROGRESS"
                  ? "bg-amber-500 text-white"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilter("COMPLETED")}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${
                filter === "COMPLETED"
                  ? "bg-emerald-500 text-white"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              Completed
            </button>
          </div>

          <ul className="space-y-3">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="bg-white/5 p-4 rounded-lg flex items-center justify-between transition-all duration-300 hover:bg-white/10 hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
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
                    className="h-5 w-5 rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-600 cursor-pointer"
                  />
                  <div
                    className={`transition-opacity ${
                      task.status === "COMPLETED" ? "opacity-50" : ""
                    }`}
                  >
                    <p
                      className={`font-semibold text-slate-100 ${
                        task.status === "COMPLETED" ? "line-through" : ""
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-sm text-slate-400">
                      Deadline: {task.deadline}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(task)}
                    className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
