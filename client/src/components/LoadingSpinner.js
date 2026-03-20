export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizeMap = { sm: 'h-6 w-6', md: 'h-10 w-10', lg: 'h-16 w-16' };
  return (
    <div className="flex flex-col justify-center items-center gap-3 py-10">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeMap[size] || sizeMap.md}`}></div>
      {text && <p className="text-gray-500 text-sm">{text}</p>}
    </div>
  );
}
