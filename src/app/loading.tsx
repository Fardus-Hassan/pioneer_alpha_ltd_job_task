
export default function Loading() {
  return (
   <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full opacity-20"></div>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
  )
}
