export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C9A55C] mx-auto mb-4"></div>
        <p className="text-[#C9A55C]">Loading...</p>
      </div>
    </div>
  );
} 