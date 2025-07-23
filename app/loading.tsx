// export default function Loading() {
//   return null
// }

export default function Loading() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-screen bg-white dark:bg-gray-900">
      <div className="w-14 h-14 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin" />
    </div>
  )
}
