"use client";

import { useGetUserQuery } from "@/redux/api/profile/profileApi";
import { useGetTodosQuery } from "@/redux/api/todo/todoApi";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useGetUserQuery();
  const { data: todosData, isLoading: todosLoading } = useGetTodosQuery({ search: "", page: 1 });

  const upcoming = todosData?.results
    ?.filter((t) => !t.is_completed)
    .slice(0, 5) || [];

  const totalTodos = todosData?.count ?? 0;
  const completedCount = todosData?.results.filter((t) => t.is_completed).length ?? 0;

  if (userLoading || todosLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 flex justify-center items-center min-h-[93vh] bg-[#EEF7FF]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <img
                src={user?.profile_image || "/default-avatar.png"}
                alt="avatar"
                className="w-20 h-20 rounded-full object-cover bg-gray-100"
              />
              <div>
                <h3 className="text-lg font-semibold text-[#0D224A]">
                  {user ? `${user.first_name} ${user.last_name}` : "User"}
                </h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm text-gray-600">
              <p>
                <span className="font-medium text-gray-800">Contact: </span>
                {user?.contact_number || "-"}
              </p>
              <p>
                <span className="font-medium text-gray-800">Address: </span>
                {user?.address || "-"}
              </p>
              <p>
                <span className="font-medium text-gray-800">Birthday: </span>
                {user?.birthday ? format(new Date(user.birthday), "dd MMM yyyy") : "-"}
              </p>
            </div>
          </div>

          {/* Main Stats */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#0D224A]">Overview</h2>
              <p className="text-sm text-gray-500">Welcome back!</p>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-gray-500">Total Tasks</p>
                <p className="text-2xl font-bold text-[#5272FF]">{totalTodos}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl">
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-xl">
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{Math.max(0, totalTodos - completedCount)}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700">Quick Actions</h3>
              <div className="flex flex-wrap gap-3 mt-3">
                <button
                  onClick={() => router.push('/todos?new=1')}
                  className="px-4 py-2 bg-[#5272FF] text-white rounded-lg cursor-pointer"
                >
                 Add New Task
                </button>
                <button
                  onClick={() => router.push('/todos')}
                  className="px-4 py-2 border border-gray-200 rounded-lg cursor-pointer"
                >
                  View All Tasks
                </button>
              </div>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#0D224A]">Upcoming</h3>
            <p className="text-sm text-gray-500 mt-1">Next few tasks</p>

            <div className="mt-4 space-y-3 max-h-[165px] overflow-y-auto">
              {upcoming.length === 0 ? (
                <p className="text-sm text-gray-500">No upcoming tasks</p>
              ) : (
                upcoming.map((t) => (
                  <div key={t.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{t.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{t.description?.slice(0, 80)}</p>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <p>{format(new Date(t.todo_date), "dd MMM")}</p>
                        <p className="mt-1 text-sm text-gray-600">{t.priority}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

