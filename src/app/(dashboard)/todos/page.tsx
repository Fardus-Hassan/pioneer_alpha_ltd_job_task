"use client";

import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { Todo, useAddTodoMutation, useDeleteTodoMutation, useGetTodosQuery, useUpdateTodoMutation } from "@/redux/api/todo/todoApi";
import Swal from "sweetalert2";

type TodoForm = {
  title: string;
  description: string;
  priority: "low" | "moderate" | "extreme";
  todo_date: string;
  is_completed?: boolean;
  position?: number;
};

export default function TodoPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "today" | "5" | "10" | "30">("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const [form, setForm] = useState<TodoForm>({
    title: "",
    description: "",
    priority: "moderate",
    todo_date: format(new Date(), "yyyy-MM-dd"),
    is_completed: false,
    position: 1,
  });

  const { data, isLoading, refetch } = useGetTodosQuery({ search, page });
  const [addTodo] = useAddTodoMutation();
  const [updateTodo] = useUpdateTodoMutation();
  const [deleteTodo] = useDeleteTodoMutation();

  // Search করলে page reset করা
  useEffect(() => {
    setPage(1);
  }, [search]);

  // First page এ results length save করা
  useEffect(() => {
    if (data && data.previous === null && data.results.length > 0) {
      setItemsPerPage(data.results.length);
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTodo) {
        await updateTodo({
          id: editingTodo.id,
          body: form,
        }).unwrap();
        setEditingTodo(null);
        await Swal.fire({
          title: "Success!",
          text: "Todo updated successfully!",
          icon: "success",
          confirmButtonColor: "#3b82f6",
        });
      } else {
        await addTodo(form).unwrap();
        await Swal.fire({
          title: "Success!",
          text: "Todo added successfully!",
          icon: "success",
          confirmButtonColor: "#3b82f6",
        });
      }

      setForm({
        title: "",
        description: "",
        priority: "moderate",
        todo_date: format(new Date(), "yyyy-MM-dd"),
        is_completed: false,
        position: 1,
      });
      setModalOpen(false);
      
      refetch();
    } catch (err) {
      console.log(err);
      await Swal.fire({
        title: "Error!",
        text: "Something went wrong!",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo);
    setForm({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      todo_date: todo.todo_date,
      is_completed: todo.is_completed,
      position: todo.position,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteTodo(id).unwrap();
        await Swal.fire({
          title: "Deleted!",
          text: "Your todo has been deleted.",
          icon: "success",
          confirmButtonColor: "#3b82f6",
        });
        refetch();
      } catch (err) {
        await Swal.fire({
          title: "Error!",
          text: "Failed to delete todo!",
          icon: "error",
          confirmButtonColor: "#ef4444",
        });
      }
    }
  };

  const toggleComplete = async (todo: Todo) => {
    try {
      await updateTodo({
        id: todo.id,
        body: {
          ...form,
          is_completed: !todo.is_completed,
        },
      }).unwrap();
      refetch();
    } catch (err) {
      console.log(err);
    }
  };

  // Pagination calculation
  const totalPages = data ? Math.ceil(data.count / itemsPerPage) : 1;

  const filteredTodos = data?.results.filter((todo) => {
    if (filter === "all") return true;
    const todoDate = new Date(todo.todo_date);
    const today = new Date();
    if (filter === "today") return format(todoDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
    if (filter === "5") return todoDate <= addDays(today, 5);
    if (filter === "10") return todoDate <= addDays(today, 10);
    if (filter === "30") return todoDate <= addDays(today, 30);
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "extreme":
        return "bg-red-100 text-red-800 border-red-200";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "extreme":
        return "🔴";
      case "moderate":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "⚪";
    }
  };

  if (isLoading) return <p className="text-center py-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Todos</h1>
          <p className="text-gray-600">Search your task here...</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Search todos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-xl py-3 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
            
            <div className="flex gap-3 w-full lg:w-auto">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1"
              >
                <option value="all">All Tasks</option>
                <option value="today">Deadline Today</option>
                <option value="5">Expires in 5 days</option>
                <option value="10">Expires in 10 days</option>
                <option value="30">Expires in 30 days</option>
              </select>
              
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2"
                onClick={() => setModalOpen(true)}
              >
                <span>+</span>
                <span>New Task</span>
              </button>
            </div>
          </div>
        </div>

        {/* Todos List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {filteredTodos && filteredTodos.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredTodos.map((todo) => (
                <div key={todo.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <button
                        onClick={() => toggleComplete(todo)}
                        className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          todo.is_completed
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300 hover:border-green-500"
                        }`}
                      >
                        {todo.is_completed && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`font-semibold text-lg ${
                            todo.is_completed ? "line-through text-gray-500" : "text-gray-800"
                          }`}>
                            {todo.title}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(todo.priority)}`}>
                            {getPriorityIcon(todo.priority)} {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                          </span>
                        </div>
                        
                        <p className={`text-gray-600 mb-3 ${
                          todo.is_completed ? "line-through" : ""
                        }`}>
                          {todo.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            📅 Due {format(new Date(todo.todo_date), "MMM dd, yyyy")}
                          </span>
                          <span className="flex items-center gap-1">
                            ⏰ Created {format(new Date(todo.created_at), "MMM dd, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => openEditModal(todo)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No todos yet</h3>
              <p className="text-gray-500 mb-6">Start by creating your first task!</p>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200"
                onClick={() => setModalOpen(true)}
              >
                Create Your First Todo
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Previous
            </button>
            
            <div className="flex gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = page <= 3 ? i + 1 : 
                              page >= totalPages - 2 ? totalPages - 4 + i : 
                              page - 2 + i;
                return pageNum <= totalPages && pageNum >= 1 ? (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-xl font-medium transition-all duration-200 ${
                      page === pageNum
                        ? "bg-blue-600 text-white shadow-lg transform scale-105"
                        : "border border-gray-300 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                ) : null;
              })}
            </div>
            
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Next
            </button>
          </div>
        )}

        {/* Page Info */}
        {data && (
          <div className="text-center mt-4 text-sm text-gray-600">
            Page {page} of {totalPages} • Total Items: {data.count} • Items per page: {itemsPerPage}
          </div>
        )}

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div 
              className="bg-white rounded-2xl w-full max-w-md transform transition-all duration-300 scale-100 animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingTodo ? "Edit Todo" : "Add New Task"}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter task title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    placeholder="Enter task description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={form.todo_date}
                    onChange={(e) => setForm({ ...form, todo_date: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <div className="flex gap-3">
                    {[
                      { value: "extreme", label: "Extreme", color: "bg-red-500" },
                      { value: "moderate", label: "Moderate", color: "bg-yellow-500" },
                      { value: "low", label: "Low", color: "bg-green-500" }
                    ].map((p) => (
                      <label key={p.value} className="flex-1 cursor-pointer">
                        <input
                          type="radio"
                          value={p.value}
                          checked={form.priority === p.value}
                          onChange={() => setForm({ ...form, priority: p.value as any })}
                          className="hidden"
                        />
                        <div className={`text-center py-3 rounded-xl border-2 transition-all duration-200 ${
                          form.priority === p.value
                            ? `border-${p.color.split('-')[1]}-500 bg-${p.color.split('-')[1]}-50 text-${p.color.split('-')[1]}-700 font-medium`
                            : "border-gray-300 text-gray-600 hover:border-gray-400"
                        }`}>
                          {p.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                    onClick={() => { 
                      setModalOpen(false); 
                      setEditingTodo(null);
                      setForm({
                        title: "",
                        description: "",
                        priority: "moderate",
                        todo_date: format(new Date(), "yyyy-MM-dd"),
                        is_completed: false,
                        position: 1,
                      });
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    {editingTodo ? "Update Task" : "Add Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Global Styles for Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}