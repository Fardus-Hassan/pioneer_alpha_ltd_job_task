"use client";

import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { Todo, useAddTodoMutation, useDeleteTodoMutation, useGetTodosQuery, useUpdateTodoMutation } from "@/redux/api/todo/todoApi";

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
      } else {
        await addTodo(form).unwrap();
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
      
      // Update/Delete করার পর refetch
      refetch();
    } catch (err) {
      console.log(err);
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
    if (confirm("Are you sure?")) {
      await deleteTodo(id).unwrap();
      // Delete করার পর refetch
      refetch();
    }
  };

  // Pagination calculation - FIXED
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

  if (isLoading) return <p className="text-center py-10">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search todos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-1/2"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="border p-2 rounded"
        >
          <option value="all">All</option>
          <option value="today">Deadline Today</option>
          <option value="5">Expires in 5 days</option>
          <option value="10">Expires in 10 days</option>
          <option value="30">Expires in 30 days</option>
        </select>
        <button
          className="bg-blue-600 text-white py-2 px-4 rounded"
          onClick={() => setModalOpen(true)}
        >
          Add Todo
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Title</th>
            <th className="p-2 text-left">Description</th>
            <th className="p-2 text-left">Priority</th>
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTodos?.map((todo) => (
            <tr key={todo.id} className="border-b">
              <td className="p-2">{todo.title}</td>
              <td className="p-2">{todo.description}</td>
              <td className="p-2">{todo.priority}</td>
              <td className="p-2">{todo.todo_date}</td>
              <td className="p-2 space-x-2">
                <button
                  className="text-blue-600"
                  onClick={() => openEditModal(todo)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600"
                  onClick={() => handleDelete(todo.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination - FIXED */}
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            className={`px-3 py-1 border rounded ${page === pageNum ? "bg-blue-600 text-white" : "bg-white text-blue-600"}`}
            onClick={() => setPage(pageNum)}
          >
            {pageNum}
          </button>
        ))}
      </div>

      {/* Current Page Info */}
      <div className="text-center mt-2 text-sm text-gray-600">
        Page {page} of {totalPages} | Total Items: {data?.count} | Items per page: {itemsPerPage}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingTodo ? "Edit Todo" : "Add Todo"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border p-2 rounded"
                required
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border p-2 rounded"
                required
              />
              <div className="flex space-x-2">
                {["low", "moderate", "extreme"].map((p) => (
                  <label key={p} className="flex items-center space-x-1">
                    <input
                      type="radio"
                      value={p}
                      checked={form.priority === p}
                      onChange={() => setForm({ ...form, priority: p as any })}
                    />
                    <span className="capitalize">{p}</span>
                  </label>
                ))}
              </div>
              <input
                type="date"
                value={form.todo_date}
                onChange={(e) => setForm({ ...form, todo_date: e.target.value })}
                className="w-full border p-2 rounded"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 border rounded"
                  onClick={() => { setModalOpen(false); setEditingTodo(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                  {editingTodo ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}