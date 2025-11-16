"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format, addDays } from "date-fns";
import {
  Todo,
  useAddTodoMutation,
  useDeleteTodoMutation,
  useGetTodosQuery,
  useUpdateTodoMutation,
} from "@/redux/api/todo/todoApi";
import Swal from "sweetalert2";
import { showSuccess } from "@/utils/alerts";

type TodoForm = {
  title: string;
  description: string;
  priority: "low" | "moderate" | "extreme";
  todo_date: string;
  is_completed?: boolean;
};

export default function TodoPage() {
  const [search, setSearch] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filter, setFilter] = useState<"all" | "today" | "5" | "10" | "30">(
    "all"
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showFilterDropdown &&
        !(event.target as Element).closest(".relative")
      ) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilterDropdown]);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState<number>(0);

  const [form, setForm] = useState<TodoForm>({
    title: "",
    description: "",
    priority: "moderate",
    todo_date: format(new Date(), "yyyy-MM-dd"),
    is_completed: false,
  });

  const { data, isLoading, refetch } = useGetTodosQuery({ search, page });
  const [addTodo] = useAddTodoMutation();
  const [updateTodo] = useUpdateTodoMutation();
  const [deleteTodo] = useDeleteTodoMutation();

  // Search করলে page reset করা
  useEffect(() => {
    setPage(1);
  }, [search]);

  // Open modal if `?new=1` is present in the URL (so external links can open the new-task modal)
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    try {
      if (searchParams?.get("new")) {
        setModalOpen(true);
        // remove the query param without adding a new history entry
        router.replace('/todos');
      }
    } catch (e) {
      // ignore in SSR or if navigation not available
    }
  }, [searchParams, router]);

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
        await showSuccess({ text: "Todo updated successfully!" });
      } else {
        await addTodo(form).unwrap();
        await showSuccess({ text: "Todo added successfully!" });
      }

      setForm({
        title: "",
        description: "",
        priority: "moderate",
        todo_date: format(new Date(), "yyyy-MM-dd"),
        is_completed: false,
      });
      setModalOpen(false);
      
      refetch();
    } catch (err: any) {
      console.log("Error:", err);
      let errorMessage = "Something went wrong!";
      
      if (err?.data?.detail) {
        errorMessage = err.data.detail;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (typeof err?.data === 'string') {
        errorMessage = err.data;
      } else if (err?.error) {
        errorMessage = err.error;
      }
      
      await Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo);
    setForm({
      title: todo.title || "",
      description: todo.description || "",
      priority: todo.priority || "moderate",
      todo_date: todo.todo_date || format(new Date(), "yyyy-MM-dd"),
      is_completed: todo.is_completed || false,
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
        await showSuccess({ text: "Your todo has been deleted." });
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

  // Pagination calculation
  const totalPages = data ? Math.ceil(data.count / itemsPerPage) : 1;

  const filteredTodos = data?.results.filter((todo) => {
    if (filter === "all") return true;
    const todoDate = new Date(todo.todo_date);
    const today = new Date();
    if (filter === "today")
      return format(todoDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
    if (filter === "5") return todoDate <= addDays(today, 5);
    if (filter === "10") return todoDate <= addDays(today, 10);
    if (filter === "30") return todoDate <= addDays(today, 30);
    return true;
  });

  if (isLoading) return <p className="text-center py-10">Loading...</p>;

  return (
    <div className="min-h-[93vh] bg-[#EEF7FF] py-8 px-4">
      <div className="">
        <div className="text-center mb-8 flex justify-between items-center flex-nowrap">
          <svg
            viewBox="0 0 242 40"
            xmlns="http://www.w3.org/2000/svg"
            width="242.000000"
            height="40.000000"
            fill="none"
          >
            <rect
              id="Frame 262"
              width="242.000000"
              height="40.000000"
              x="0.000000"
              y="0.000000"
            />
            <path
              id="Todos"
              d="M1.43466 6.47301L1.43466 1.90909L22.9375 1.90909L22.9375 6.47301L14.9219 6.47301L14.9219 28.0909L9.45028 28.0909L9.45028 6.47301L1.43466 6.47301ZM32.4009 28.4744C30.4151 28.4744 28.6978 28.0526 27.2489 27.2088C25.8086 26.3565 24.6964 25.1719 23.9123 23.6548C23.1282 22.1293 22.7362 20.3608 22.7362 18.3494C22.7362 16.321 23.1282 14.5483 23.9123 13.0312C24.6964 11.5057 25.8086 10.321 27.2489 9.47727C28.6978 8.625 30.4151 8.19886 32.4009 8.19886C34.3867 8.19886 36.0998 8.625 37.5401 9.47727C38.989 10.321 40.1055 11.5057 40.8896 13.0312C41.6737 14.5483 42.0657 16.321 42.0657 18.3494C42.0657 20.3608 41.6737 22.1293 40.8896 23.6548C40.1055 25.1719 38.989 26.3565 37.5401 27.2088C36.0998 28.0526 34.3867 28.4744 32.4009 28.4744ZM32.4265 24.2557C33.3299 24.2557 34.0842 24 34.6893 23.4886C35.2944 22.9687 35.7504 22.2614 36.0572 21.3665C36.3725 20.4716 36.5302 19.4531 36.5302 18.3111C36.5302 17.169 36.3725 16.1506 36.0572 15.2557C35.7504 14.3608 35.2944 13.6534 34.6893 13.1335C34.0842 12.6136 33.3299 12.3537 32.4265 12.3537C31.5146 12.3537 30.7475 12.6136 30.1254 13.1335C29.5117 13.6534 29.0472 14.3608 28.7319 15.2557C28.4251 16.1506 28.2717 17.169 28.2717 18.3111C28.2717 19.4531 28.4251 20.4716 28.7319 21.3665C29.0472 22.2614 29.5117 22.9687 30.1254 23.4886C30.7475 24 31.5146 24.2557 32.4265 24.2557ZM52.8427 28.4105C51.3512 28.4105 50.0004 28.027 48.7901 27.2599C47.5884 26.4844 46.6339 25.3466 45.9265 23.8466C45.2276 22.3381 44.8782 20.4886 44.8782 18.2983C44.8782 16.0483 45.2404 14.1776 45.9648 12.6861C46.6893 11.1861 47.6523 10.0653 48.854 9.32386C50.0643 8.57386 51.3896 8.19886 52.8299 8.19886C53.9293 8.19886 54.8455 8.38636 55.5785 8.76136C56.32 9.12784 56.9165 9.58807 57.3683 10.142C57.8285 10.6875 58.1779 11.2244 58.4165 11.7528L58.5827 11.7528L58.5827 1.90909L64.016 1.90909L64.016 28.0909L58.6467 28.0909L58.6467 24.946L58.4165 24.946C58.1609 25.4915 57.7987 26.0327 57.3299 26.5696C56.8697 27.098 56.2688 27.5369 55.5273 27.8864C54.7944 28.2358 53.8995 28.4105 52.8427 28.4105ZM54.5685 24.0767C55.4464 24.0767 56.1879 23.8381 56.793 23.3608C57.4066 22.875 57.8754 22.1974 58.1992 21.3281C58.5316 20.4588 58.6978 19.4403 58.6978 18.2727C58.6978 17.1051 58.5359 16.0909 58.212 15.2301C57.8881 14.3693 57.4194 13.7045 56.8058 13.2358C56.1921 12.767 55.4464 12.5327 54.5685 12.5327C53.6737 12.5327 52.9194 12.7756 52.3058 13.2614C51.6921 13.7472 51.2276 14.4205 50.9123 15.2812C50.5969 16.142 50.4393 17.1392 50.4393 18.2727C50.4393 19.4148 50.5969 20.4247 50.9123 21.3026C51.2362 22.1719 51.7006 22.8537 52.3058 23.348C52.9194 23.8338 53.6737 24.0767 54.5685 24.0767ZM77.3658 28.4744C75.38 28.4744 73.6626 28.0526 72.2138 27.2088C70.7734 26.3565 69.6612 25.1719 68.8771 23.6548C68.093 22.1293 67.701 20.3608 67.701 18.3494C67.701 16.321 68.093 14.5483 68.8771 13.0312C69.6612 11.5057 70.7734 10.321 72.2138 9.47727C73.6626 8.625 75.38 8.19886 77.3658 8.19886C79.3516 8.19886 81.0646 8.625 82.505 9.47727C83.9538 10.321 85.0703 11.5057 85.8544 13.0312C86.6385 14.5483 87.0305 16.321 87.0305 18.3494C87.0305 20.3608 86.6385 22.1293 85.8544 23.6548C85.0703 25.1719 83.9538 26.3565 82.505 27.2088C81.0646 28.0526 79.3516 28.4744 77.3658 28.4744ZM77.3913 24.2557C78.2947 24.2557 79.049 24 79.6541 23.4886C80.2592 22.9687 80.7152 22.2614 81.022 21.3665C81.3374 20.4716 81.495 19.4531 81.495 18.3111C81.495 17.169 81.3374 16.1506 81.022 15.2557C80.7152 14.3608 80.2592 13.6534 79.6541 13.1335C79.049 12.6136 78.2947 12.3537 77.3913 12.3537C76.4794 12.3537 75.7124 12.6136 75.0902 13.1335C74.4766 13.6534 74.0121 14.3608 73.6967 15.2557C73.3899 16.1506 73.2365 17.169 73.2365 18.3111C73.2365 19.4531 73.3899 20.4716 73.6967 21.3665C74.0121 22.2614 74.4766 22.9687 75.0902 23.4886C75.7124 24 76.4794 24.2557 77.3913 24.2557ZM106.91 14.054L101.924 14.3608C101.839 13.9347 101.656 13.5511 101.374 13.2102C101.093 12.8608 100.722 12.5838 100.262 12.3793C99.8104 12.1662 99.2692 12.0597 98.6385 12.0597C97.7947 12.0597 97.0831 12.2386 96.5036 12.5966C95.924 12.946 95.6342 13.4148 95.6342 14.0028C95.6342 14.4716 95.8217 14.8679 96.1967 15.1918C96.5717 15.5156 97.2152 15.7756 98.1271 15.9716L101.681 16.6875C103.59 17.0795 105.013 17.7102 105.951 18.5795C106.888 19.4489 107.357 20.5909 107.357 22.0057C107.357 23.2926 106.978 24.4219 106.219 25.3935C105.469 26.3651 104.438 27.1236 103.126 27.669C101.822 28.206 100.317 28.4744 98.6129 28.4744C96.0135 28.4744 93.9425 27.9332 92.3999 26.8509C90.8658 25.7599 89.9666 24.277 89.7024 22.402L95.059 22.1207C95.2209 22.9134 95.6129 23.5185 96.2351 23.9361C96.8572 24.3452 97.6541 24.5497 98.6257 24.5497C99.5803 24.5497 100.347 24.3665 100.927 24C101.515 23.625 101.813 23.1435 101.822 22.5554C101.813 22.0611 101.604 21.6562 101.195 21.3409C100.786 21.017 100.156 20.7699 99.3033 20.5994L95.9027 19.9219C93.9851 19.5384 92.5575 18.8736 91.62 17.9276C90.691 16.9815 90.2266 15.7756 90.2266 14.3097C90.2266 13.0483 90.5675 11.9616 91.2493 11.0497C91.9396 10.1378 92.907 9.43466 94.1513 8.94034C95.4041 8.44602 96.87 8.19886 98.549 8.19886C101.029 8.19886 102.981 8.72301 104.404 9.77131C105.836 10.8196 106.671 12.2472 106.91 14.054Z"
              fill="rgb(12.7057,33.8758,74.375)"
              fillRule="nonzero"
            />
            <line
              id="Line 6"
              x1="3.15625"
              x2="71.15625"
              y1="39"
              y2="39"
              stroke="rgb(82.1394,114.151,255)"
              strokeWidth="2"
            />
          </svg>
          <button
            className="bg-[#5272FF] hover:bg-blue-700 text-white py-3 px-6 rounded-xl text-xs md:text-base transition-all  duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2"
            onClick={() => setModalOpen(true)}
          >
            <svg
              viewBox="0 0 14 16"
              xmlns="http://www.w3.org/2000/svg"
              width="14.000000"
              height="16.000000"
              fill="none"
            >
              <rect
                id="Frame"
                width="14.000000"
                height="16.000000"
                x="0.000000"
                y="0.000000"
                fill="rgb(0,0,0)"
                fillOpacity="0"
              />
              <rect
                id="Frame"
                width="14.000000"
                height="16.000000"
                x="0.000000"
                y="0.000000"
                stroke="rgb(82.1394,114.151,255)"
                strokeWidth="0"
              />
              <path
                id="Vector"
                d="M8 2.5C8 1.94687 7.55312 1.5 7 1.5C6.44688 1.5 6 1.94687 6 2.5L6 7L1.5 7C0.946875 7 0.5 7.44688 0.5 8C0.5 8.55313 0.946875 9 1.5 9L6 9L6 13.5C6 14.0531 6.44688 14.5 7 14.5C7.55312 14.5 8 14.0531 8 13.5L8 9L12.5 9C13.0531 9 13.5 8.55313 13.5 8C13.5 7.44688 13.0531 7 12.5 7L8 7L8 2.5Z"
                fill="rgb(255,255,255)"
                fillRule="nonzero"
              />
            </svg>

            <span className="text-nowrap">New Task</span>
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="">
          <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Search your task here..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 bg-white rounded-lg placeholder:text-[#4B5563] placeholder:-translate-y-0.5 placeholder:text-xs py-[5px] px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                viewBox="0 0 36 36"
                className="absolute right-0 top-0"
                xmlns="http://www.w3.org/2000/svg"
                width="36.000000"
                height="36.000000"
                fill="none"
              >
                <g id="SearchICon">
                  <rect
                    id="Rectangle 3"
                    width="36.000000"
                    height="36.000000"
                    x="0.000000"
                    y="0.000000"
                    rx="8.000000"
                    fill="rgb(82.1394,114.151,255)"
                  />
                  <path
                    id="Search"
                    d="M6.79942 1.5335e-08C5.7151 9.23933e-05 4.64651 0.259491 3.68283 0.756555C2.71914 1.25362 1.8883 1.97393 1.25961 2.8574C0.630925 3.74087 0.222629 4.76188 0.0687882 5.83524C-0.0850531 6.90859 0.0200211 8.00318 0.375244 9.02767C0.730467 10.0522 1.32554 10.9768 2.11081 11.7246C2.89608 12.4723 3.84879 13.0214 4.88943 13.3261C5.93008 13.6307 7.02849 13.6821 8.09304 13.4759C9.15758 13.2697 10.1574 12.812 11.009 12.1408L13.9306 15.0624C14.0815 15.2081 14.2836 15.2888 14.4933 15.2869C14.7031 15.2851 14.9037 15.201 15.0521 15.0527C15.2004 14.9043 15.2845 14.7037 15.2864 14.4939C15.2882 14.2842 15.2075 14.0821 15.0618 13.9312L12.1402 11.0096C12.9306 10.0069 13.4228 8.80192 13.5603 7.53258C13.6979 6.26324 13.4753 4.98082 12.918 3.83207C12.3607 2.68333 11.4913 1.71468 10.4093 1.03699C9.3272 0.359285 8.07619 -8.57147e-05 6.79942 1.5335e-08ZM1.59942 6.8C1.59942 5.42087 2.14728 4.09823 3.12247 3.12304C4.09766 2.14786 5.4203 1.6 6.79942 1.6C8.17855 1.6 9.50119 2.14786 10.4764 3.12304C11.4516 4.09823 11.9994 5.42087 11.9994 6.8C11.9994 8.17913 11.4516 9.50177 10.4764 10.477C9.50119 11.4521 8.17855 12 6.79942 12C5.4203 12 4.09766 11.4521 3.12247 10.477C2.14728 9.50177 1.59942 8.17913 1.59942 6.8Z"
                    fill="rgb(255,255,255)"
                    fillRule="evenodd"
                    transform="matrix(0.997424,-0.0717355,0.0717355,0.997424,9.87134,11.2002)"
                  />
                </g>
              </svg>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="border border-gray-300 rounded-lg p-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between gap-3 w-full bg-white"
              >
                <span className="text-gray-700">Filter By</span>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 11 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.204 8.321L9.801 6.724L10.508 7.431L8.058 9.881L7.704 10.235L7.351 9.882L4.901 7.432L5.608 6.724L7.204 8.321V0.217H8.204V8.321ZM2.304 1.914V10.018H3.304V1.914L4.901 3.511L5.608 2.804L3.158 0.354L2.803 0L2.449 0.354L0 2.804L0.707 3.511L2.304 1.914Z"
                    fill="#201F1E"
                  />
                </svg>
              </button>

              {showFilterDropdown && (
                <div className="absolute top-9 right-0 mt-2 w-[174px] bg-white rounded shadow-lg border border-gray-200 z-10 p-5">
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Date
                    </p>
                    <div className="h-px bg-gray-200 mb-2"></div>
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filter === "today"}
                        onChange={() =>
                          setFilter(filter === "today" ? "all" : "today")
                        }
                        className="w-[14px] h-[14px] rounded-sm border-2 border-gray-300 cursor-pointer"
                      />
                      <span className="ml-2 text-xs text-gray-700 group-hover:text-gray-900">
                        Deadline Today
                      </span>
                    </label>

                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filter === "5"}
                        onChange={() => setFilter(filter === "5" ? "all" : "5")}
                        className="w-[14px] h-[14px] rounded-sm border-2 border-gray-300 cursor-pointer"
                      />
                      <span className="ml-2 text-xs text-gray-700 group-hover:text-gray-900">
                        Expires in 5 days
                      </span>
                    </label>

                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filter === "10"}
                        onChange={() => setFilter(filter === "10" ? "all" : "10")}
                        className="w-[14px] h-[14px] rounded-sm border-2 border-gray-300 cursor-pointer"
                      />
                      <span className="ml-2 text-xs text-gray-700 group-hover:text-gray-900">
                        Expires in 10 days
                      </span>
                    </label>

                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filter === "30"}
                        onChange={() => setFilter(filter === "30" ? "all" : "30")}
                        className="w-[14px] h-[14px] rounded-sm border-2 border-gray-300 cursor-pointer"
                      />
                      <span className="ml-2 text-xs text-gray-700 group-hover:text-gray-900">
                        Expires in 30 days
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Todos List */}
        <div className="sm:mt-11 mt-6">

          {filteredTodos && filteredTodos.length > 0 ? <h2 className="text-lg font-bold text-black mb-4">Your Tasks</h2> : "" }

          {filteredTodos && filteredTodos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[470px] overflow-y-auto">
              {filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200"
                >
                  {/* Header with Title and Priority */}
                  <div className="flex items-start justify-between mb-3">
                    <h3
                      className={`font-semibold text-gray-900 flex-1 pr-2 ${
                        todo.is_completed ? "line-through text-gray-500" : ""
                      }`}
                    >
                            {todo.title}
                          </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          todo.priority === "extreme"
                            ? "bg-red-100 text-red-700"
                            : todo.priority === "moderate"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {todo.priority.charAt(0).toUpperCase() +
                          todo.priority.slice(1)}
                          </span>
                      <svg
                        viewBox="0 0 9 14"
                        xmlns="http://www.w3.org/2000/svg"
                        width="9.000000"
                        height="14.000000"
                        fill="none"
                      >
                        <rect
                          id="Frame 1000005074"
                          width="9.000000"
                          height="14.000000"
                          x="0.000000"
                          y="0.000000"
                        />
                        <rect
                          id="Rectangle 361"
                          width="4.000000"
                          height="4.000000"
                          x="0.000000"
                          y="0.000000"
                          rx="1.000000"
                          fill="rgb(140,163,205)"
                        />
                        <rect
                          id="Rectangle 363"
                          width="4.000000"
                          height="4.000000"
                          x="0.000000"
                          y="5.000000"
                          rx="1.000000"
                          fill="rgb(140,163,205)"
                        />
                        <rect
                          id="Rectangle 365"
                          width="4.000000"
                          height="4.000000"
                          x="0.000000"
                          y="10.000000"
                          rx="1.000000"
                          fill="rgb(140,163,205)"
                        />
                        <rect
                          id="Rectangle 362"
                          width="4.000000"
                          height="4.000000"
                          x="5.000000"
                          y="0.000000"
                          rx="1.000000"
                          fill="rgb(140,163,205)"
                        />
                        <rect
                          id="Rectangle 364"
                          width="4.000000"
                          height="4.000000"
                          x="5.000000"
                          y="5.000000"
                          rx="1.000000"
                          fill="rgb(140,163,205)"
                        />
                        <rect
                          id="Rectangle 366"
                          width="4.000000"
                          height="4.000000"
                          x="5.000000"
                          y="10.000000"
                          rx="1.000000"
                          fill="rgb(140,163,205)"
                        />
                      </svg>
                    </div>
                        </div>
                        
                  {/* Description */}
                  <p
                    className={`text-gray-600 text-sm mb-4 line-clamp-2 ${
                      todo.is_completed ? "line-through text-gray-400" : ""
                    }`}
                  >
                          {todo.description}
                        </p>
                        
                  {/* Footer with Due Date and Actions */}
                  <div className="flex items-center justify-between pt-3">
                    <span className="text-sm text-gray-500">
                      Due {format(new Date(todo.todo_date), "MMM dd, yyyy")}
                          </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(todo)}
                        className=" bg-[#EEF7FF] hover:bg-blue-100 p-[9px] rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg
                          viewBox="0 0 16 16"
                          xmlns="http://www.w3.org/2000/svg"
                          width="16.000000"
                          height="16.000000"
                          fill="none"
                        >
                          <rect
                            id="icon-edit"
                            width="16.000000"
                            height="16.000000"
                            x="0.000000"
                            y="0.000000"
                            fill="rgb(0,0,0)"
                            fillOpacity="0"
                          />
                          <path
                            id="Combined-Shape"
                            d="M13.8336 13.6264C14.1096 13.6264 14.3336 13.8504 14.3336 14.1264C14.3336 14.4024 14.1096 14.6264 13.8336 14.6264L8.99824 14.6264C8.72223 14.6264 8.49824 14.4024 8.49824 14.1264C8.49824 13.8504 8.72223 13.6264 8.99824 13.6264L13.8336 13.6264ZM10.7441 2.43576C10.7774 2.46176 11.8928 3.32843 11.8928 3.32843C12.2981 3.56976 12.6148 4.00109 12.7348 4.51176C12.8541 5.0171 12.7674 5.53843 12.4894 5.97909C12.4876 5.98203 12.4857 5.98494 12.4793 5.99358L12.4743 6.00025C12.4292 6.05972 12.233 6.30776 11.243 7.54815C11.2338 7.56441 11.2233 7.57963 11.212 7.59443C11.1953 7.61624 11.1771 7.63628 11.1577 7.65453C11.0902 7.73956 11.0189 7.8289 10.9439 7.92283L10.7919 8.11313C10.4784 8.50579 10.1065 8.97139 9.66529 9.52364L9.43886 9.80705C8.58708 10.8732 7.49621 12.2382 6.09877 13.9864C5.79277 14.3678 5.3341 14.5898 4.84143 14.5958L2.41543 14.6264L2.40877 14.6264C2.17743 14.6264 1.9761 14.4678 1.9221 14.2418L1.3761 11.9278C1.26343 11.4484 1.37543 10.9538 1.68277 10.5698L7.96277 2.7151C7.96543 2.71243 7.96744 2.7091 7.9701 2.70643C8.65877 1.8831 9.9041 1.76176 10.7441 2.43576ZM7.26259 5.19133L2.46343 11.1944C2.34943 11.3371 2.30743 11.5211 2.34943 11.6978L2.80343 13.6211L4.82943 13.5958C5.0221 13.5938 5.2001 13.5078 5.3181 13.3611C5.92576 12.6008 6.68947 11.6452 7.47467 10.6627L7.75247 10.315L8.03074 9.96681C8.76713 9.04526 9.49463 8.13471 10.1033 7.37258L7.26259 5.19133ZM8.7401 3.34443L7.88725 4.41L10.7278 6.59062C11.2745 5.9058 11.6342 5.45476 11.6674 5.41176C11.7768 5.23443 11.8194 4.98376 11.7621 4.74243C11.7034 4.4951 11.5494 4.2851 11.3274 4.15109C11.2801 4.11843 10.1568 3.24643 10.1221 3.21909C9.69944 2.88043 9.08277 2.9391 8.7401 3.34443Z"
                            fill="rgb(79,70,229)"
                            fillRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className=" bg-[#EEF7FF] hover:bg-red-50 p-[9px] rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg
                          viewBox="0 0 12.3054 13.333"
                          xmlns="http://www.w3.org/2000/svg"
                          width="12.305420"
                          height="13.333008"
                          fill="none"
                        >
                          <path
                            id="Combined-Shape"
                            d="M10.9231 4.4798C11.1984 4.50247 11.4037 4.74313 11.3817 5.01847C11.3777 5.0638 11.0164 9.5378 10.8084 11.4145C10.6791 12.5791 9.90973 13.2878 8.7484 13.3091C7.85973 13.3245 7.0024 13.3331 6.1644 13.3331C5.26107 13.3331 4.3804 13.3231 3.50907 13.3051C2.3944 13.2831 1.62307 12.5605 1.49707 11.4191C1.28707 9.5258 0.927733 5.06313 0.9244 5.01847C0.901733 4.74313 1.10707 4.5018 1.3824 4.4798C1.65373 4.47247 1.89907 4.66313 1.92107 4.9378C1.92319 4.96674 2.07009 6.78915 2.23017 8.59227L2.26233 8.9521C2.34295 9.84835 2.42468 10.7096 2.49107 11.3091C2.5624 11.9578 2.9124 12.2925 3.52973 12.3051C5.1964 12.3405 6.89707 12.3425 8.7304 12.3091C9.3864 12.2965 9.74107 11.9685 9.8144 11.3045C10.0211 9.4418 10.3811 4.98313 10.3851 4.9378C10.4071 4.66313 10.6504 4.47113 10.9231 4.4798ZM7.5636 0C8.1756 0 8.7136 0.412666 8.8716 1.004L9.04093 1.84467C9.09565 2.12025 9.3375 2.3215 9.61752 2.32593L11.8053 2.326C12.0813 2.326 12.3053 2.55 12.3053 2.826C12.3053 3.102 12.0813 3.326 11.8053 3.326L9.63706 3.3259C9.63369 3.32597 9.63032 3.326 9.62693 3.326L9.61067 3.32533L2.69441 3.32592C2.68904 3.32597 2.68365 3.326 2.67827 3.326L2.668 3.32533L0.5 3.326C0.224 3.326 0 3.102 0 2.826C0 2.55 0.224 2.326 0.5 2.326L2.68733 2.32533L2.75468 2.32107C3.00554 2.28852 3.21402 2.098 3.26493 1.84467L3.42693 1.034C3.5916 0.412667 4.1296 0 4.7416 0L7.5636 0ZM7.5636 1L4.7416 1C4.5816 1 4.44093 1.10733 4.40027 1.26133L4.24493 2.04133C4.22519 2.14013 4.19644 2.23534 4.15966 2.32618L8.14574 2.32618C8.10891 2.23534 8.0801 2.14013 8.06027 2.04133L7.89827 1.23067C7.86427 1.10733 7.7236 1 7.5636 1Z"
                            fill="rgb(220,38,38)"
                            fillRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl">
              <div className="text-6xl mb-4"><img src="/empty-todo.png" alt="empty-todo" className="mx-auto" /></div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No todos yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start by creating your first task!
              </p>
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
                const pageNum =
                  page <= 3
                    ? i + 1
                    : page >= totalPages - 2
                    ? totalPages - 4 + i
                    : page - 2 + i;
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
          {data && data.count > 0 && (
          <div className="text-center mt-4 text-sm text-gray-600">
              Page {page} of {totalPages} • Total Items: {data.count} • Items per
              page: {itemsPerPage}
          </div>
        )}

        {/* Modal */}
        {modalOpen && (
  <div 
    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn"
    onClick={() => {
      setModalOpen(false);
      setEditingTodo(null);
      setForm({
        title: "",
        description: "",
        priority: "moderate",
        todo_date: format(new Date(), "yyyy-MM-dd"),
        is_completed: false,
      });
    }}
  >
    <div
      className="bg-white rounded-3xl w-full max-w-lg transform transition-all duration-300 scale-100 animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {editingTodo ? "Edit Task" : "Add New Task"}
                </h2>
        <button
          onClick={() => {
            setModalOpen(false);
            setEditingTodo(null);
            setForm({
              title: "",
              description: "",
              priority: "moderate",
              todo_date: format(new Date(), "yyyy-MM-dd"),
              is_completed: false,
            });
          }}
          className="text-sm font-semibold text-gray-900 hover:text-gray-700 underline"
        >
          Go Back
        </button>
              </div>
              
      <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
        {/* Title */}
                <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Title
                  </label>
                  <input
                    type="text"
            placeholder=""
                    value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                
        {/* Date */}
                <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Date
                  </label>
          <div className="relative">
                  <input
                    type="date"
                    value={form.todo_date}
              onChange={(e) =>
                setForm({ ...form, todo_date: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
            <svg width="15" className="absolute right-[17px] top-[50%] translate-y-[-50%] z-0 pointer-events-none" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.5 1.34715L9.89685 1.34717V0.450106C9.89685 0.201422 9.69548 0 9.44685 0C9.19823 0 8.99685 0.201422 8.99685 0.450106V1.34694H5.39685V0.450106C5.39685 0.201422 5.19548 0 4.94685 0C4.69823 0 4.49685 0.201422 4.49685 0.450106V1.34694H0.9C0.402975 1.34694 0 1.75001 0 2.24715V13.4998C0 13.9969 0.402975 14.4 0.9 14.4H13.5C13.997 14.4 14.4 13.9969 14.4 13.4998V2.24715C14.4 1.75022 13.997 1.34715 13.5 1.34715ZM13.5 13.4998H0.9V2.24715H4.49685V2.70063C4.49685 2.9493 4.69823 3.15074 4.94685 3.15074C5.19548 3.15074 5.39685 2.9493 5.39685 2.70063V2.24738H8.99685V2.70086C8.99685 2.94954 9.19823 3.15096 9.44685 3.15096C9.69548 3.15096 9.89685 2.94954 9.89685 2.70086V2.24738H13.5V13.4998ZM10.35 7.19852H11.25C11.4984 7.19852 11.7 6.99688 11.7 6.74842V5.84821C11.7 5.59975 11.4984 5.3981 11.25 5.3981H10.35C10.1016 5.3981 9.9 5.59975 9.9 5.84821V6.74842C9.9 6.99688 10.1016 7.19852 10.35 7.19852ZM10.35 10.7991H11.25C11.4984 10.7991 11.7 10.5977 11.7 10.349V9.44883C11.7 9.20037 11.4984 8.99872 11.25 8.99872H10.35C10.1016 8.99872 9.9 9.20037 9.9 9.44883V10.349C9.9 10.5979 10.1016 10.7991 10.35 10.7991ZM7.65 8.99872H6.75C6.5016 8.99872 6.3 9.20037 6.3 9.44883V10.349C6.3 10.5977 6.5016 10.7991 6.75 10.7991H7.65C7.8984 10.7991 8.1 10.5977 8.1 10.349V9.44883C8.1 9.20059 7.8984 8.99872 7.65 8.99872ZM7.65 5.3981H6.75C6.5016 5.3981 6.3 5.59975 6.3 5.84821V6.74842C6.3 6.99688 6.5016 7.19852 6.75 7.19852H7.65C7.8984 7.19852 8.1 6.99688 8.1 6.74842V5.84821C8.1 5.59952 7.8984 5.3981 7.65 5.3981ZM4.05 5.3981H3.15C2.9016 5.3981 2.7 5.59975 2.7 5.84821V6.74842C2.7 6.99688 2.9016 7.19852 3.15 7.19852H4.05C4.2984 7.19852 4.5 6.99688 4.5 6.74842V5.84821C4.5 5.59952 4.2984 5.3981 4.05 5.3981ZM4.05 8.99872H3.15C2.9016 8.99872 2.7 9.20037 2.7 9.44883V10.349C2.7 10.5977 2.9016 10.7991 3.15 10.7991H4.05C4.2984 10.7991 4.5 10.5977 4.5 10.349V9.44883C4.5 9.20059 4.2984 8.99872 4.05 8.99872Z" fill="#A1A3AB"/>
</svg>

          </div>
                </div>
                
        {/* Priority */}
                <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Priority
                  </label>
          <div className="flex items-center gap-6">
            <label className="flex flex-row-reverse items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="priority"
                value="extreme"
                checked={form.priority === "extreme"}
                onChange={(e) => setForm({ ...form, priority: e.target.value as "low" | "moderate" | "extreme" })}
                className="w-4 h-4 text-red-500 focus:ring-red-500"
              />
              <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Extreme
              </span>
            </label>

            <label className="flex flex-row-reverse items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="priority"
                value="moderate"
                checked={form.priority === "moderate"}
                onChange={(e) => setForm({ ...form, priority: e.target.value as "low" | "moderate" | "extreme" })}
                className="w-4 h-4 text-green-500 focus:ring-green-500"
              />
              <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Moderate
              </span>
            </label>

            <label className="flex flex-row-reverse items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                name="priority"
                value="low"
                checked={form.priority === "low"}
                onChange={(e) => setForm({ ...form, priority: e.target.value as "low" | "moderate" | "extreme" })}
                className="w-4 h-4 text-yellow-500 focus:ring-yellow-500"
              />
              <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                Low
              </span>
                      </label>
                  </div>
                </div>
                
        {/* Edit-only fields: is_completed and position */}
        {editingTodo && (
          <>
            {/* Is Completed */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_completed || false}
                  onChange={(e) =>
                    setForm({ ...form, is_completed: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-gray-900">
                  Mark as Completed
                </span>
              </label>
            </div>
          </>
        )}

        {/* Task Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Task Description
          </label>
          <textarea
            placeholder="Start writing here....."
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            rows={6}
            className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-sm"
            required
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center pt-2">
          <button
            type="submit"
            className="px-8 py-2.5 bg-[#5272FF] hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 text-sm"
          >
            Done
          </button>
                  <button
                    type="button"
                    onClick={() => { 
                      setModalOpen(false); 
                      setEditingTodo(null);
                      setForm({
                        title: "",
                        description: "",
                        priority: "moderate",
                        todo_date: format(new Date(), "yyyy-MM-dd"),
                        is_completed: false,
                        
                      });
                    }}
            className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
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
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
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
