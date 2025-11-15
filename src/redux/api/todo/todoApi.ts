import { apiSlice } from "../apiSlice";

export interface Todo {
  id: number;
  title: string;
  description: string;
  priority: "low" | "moderate" | "extreme";
  is_completed: boolean;
  position: number;
  todo_date: string;
  created_at: string;
  updated_at: string;
}

interface TodosResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Todo[];
}

export interface TodoPayload {
  title: string;
  description: string;
  priority: "low" | "moderate" | "extreme";
  todo_date: string;
  is_completed?: boolean;
  position?: number;
}

export const todoApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTodos: builder.query<TodosResponse, { search?: string; page?: number }>({
      query: ({ search = "", page = 1 }) => `todos/?page=${page}&search=${search}`,
      providesTags: ["Todos"],
    }),
    addTodo: builder.mutation<Todo, TodoPayload>({
      query: (body) => ({
        url: "todos/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Todos"],
    }),
    updateTodo: builder.mutation<Todo, { id: number; body: Partial<TodoPayload> }>({
      query: ({ id, body }) => ({
        url: `todos/${id}/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Todos"],
    }),
    deleteTodo: builder.mutation<any, number>({
      query: (id) => ({
        url: `todos/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Todos"],
    }),
  }),
});

export const {
  useGetTodosQuery,
  useAddTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
} = todoApi;
