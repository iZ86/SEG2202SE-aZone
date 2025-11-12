export default function FeesSummary() {
  return (
    <div className="bg-white rounded-xl p-8 flex flex-col font-bold gap-y-4 max-w-102 text-gray-davy drop-shadow-lg break-all">
      <div className="flex gap-x-8">
        <p className="max-w-36 min-w-36">Programme Fee</p>
        <p>RM 0.00</p>
      </div>
      <div className="flex gap-x-8">
        <p className="max-w-36 min-w-36">Excess Fee</p>
        <p>RM 1,000.00</p>
      </div>
      <div className="flex gap-x-8 text-black">
        <p className="max-w-36 min-w-36">Total Amount Due</p>
        <p>RM 1,000.00</p>
      </div>
      <div className="flex gap-x-8 text-black">
        <p className="max-w-36 min-w-36">Total Amount Dueeeeeee</p>
        <p>RM 1,000.00</p>
      </div>
    </div>
  );
}
