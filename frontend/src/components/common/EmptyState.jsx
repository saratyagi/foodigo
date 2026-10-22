export default function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <span className="text-6xl mb-4 select-none">{icon}</span>
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
      {description && <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">{description}</p>}
      {action}
    </div>
  )
}
