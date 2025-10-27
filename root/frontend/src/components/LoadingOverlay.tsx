// Use it with loading states, set it to true/false as needed
export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
      <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
    </div>
  );
}
