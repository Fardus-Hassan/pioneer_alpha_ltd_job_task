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
    <div className="p-4 lg:p-6 min-h-[93vh] bg-[#EEF7FF]">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#0D224A]">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your overview</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl p-6 shadow-sm">
            <div className="flex flex-col items-center text-center gap-4">
              <img
                src={user?.profile_image || "/profile.jpg"}
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

          <div className="lg:col-span-6 bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#0D224A]">Overview</h2>
              <p className="text-sm text-gray-500">Welcome back!</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Tasks</p>
                <p className="text-4xl font-bold text-[#5272FF]">{totalTodos}</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <p className="text-sm font-medium text-gray-600 mb-2">Completed</p>
                <p className="text-4xl font-bold text-green-600">{completedCount}</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                <p className="text-sm font-medium text-gray-600 mb-2">Pending</p>
                <p className="text-4xl font-bold text-yellow-600">{Math.max(0, totalTodos - completedCount)}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => router.push('/todos?new=1')}
                  className="sm:px-6 sm:py-3 px-4 py-2 bg-[#5272FF] text-white rounded-lg text-sm sm:text-base cursor-pointer hover:bg-[#4060E8] transition-colors font-medium"
                >
                  Add New Task
                </button>
                <button
                  onClick={() => router.push('/todos')}
                  className="sm:px-6 sm:py-3 px-4 py-2 border border-gray-300 rounded-lg text-sm sm:text-base cursor-pointer hover:bg-gray-50 transition-colors font-medium"
                >
              View All Tasks
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-[#0D224A] mb-2">Upcoming Tasks</h3>
            <p className="text-sm text-gray-500 mb-4">Next few tasks</p>

            <div className="space-y-3 max-h-[220px] overflow-y-auto">
              {upcoming.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">No upcoming tasks</p>
                </div>
              ) : (
                upcoming.map((t) => (
                  <div key={t.id} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800 mb-1">{t.title}</p>
                        <p className="text-xs text-gray-600 line-clamp-2">{t.description?.slice(0, 100)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-medium text-gray-600">{format(new Date(t.todo_date), "dd MMM")}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-white text-xs font-medium text-gray-700 rounded border border-gray-300">{t.priority}</span>
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