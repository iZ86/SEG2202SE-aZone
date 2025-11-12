

// export default function StudentInformationPanelExtended() {
//   return (
//     <div className="bg-white rounded-xl flex flex-wrap justify-between px-12 py-8 items-between drop-shadow-lg">

//       <div className="flex justify-between w-full max-w-112">
//         <div className="flex flex-col font-bold text-gray-davy justify-between">
//           <p>Student Name</p>
//           <p>Student ID</p>
//           <p>IC/Passport</p>
//           <p>Programme</p>
//         </div>
//         <div className="flex flex-col font-bold text-black justify-between text-right">
//           <p>Jane Doe</p>
//           <p>JK23061946</p>
//           <p>010101-01-0101</p>
//           <p>Bachelor of Software Engineering (Hons)</p>
//         </div>
//       </div>

//       <div className="flex justify-between w-full max-w-112">
//         <div className="flex flex-col font-bold text-gray-davy justify-between">
//           <p>Intake</p>
//           <p>Study Mode</p>
//           <p>Semester</p>
//           <p>Semester Period</p>
//         </div>
//         <div className="flex flex-col font-bold text-black justify-between text-right">
//           <p>202509</p>
//           <p>Full Time</p>
//           <p>4</p>
//           <p>22 Sep 2025 - 16 Jan 2026</p>
//         </div>
//       </div>

//     </div>
//   );
// }


export default function StudentInformationPanelExtended() {
  return (

    <div className="bg-white rounded-xl flex flex-wrap gap-y-4 justify-between px-12 py-8 drop-shadow-lg break-all">
      <div className="flex flex-col text-gray-davy font-bold max-w-112 w-full gap-y-4">
        <div className="flex gap-x-8">
          <p className="max-w-32 min-w-32">Student Name</p>
          <p className="text-black">Jane Doe</p>
        </div>
        <div className="flex gap-x-8">
          <p className="max-w-32 min-w-32">Student ID</p>
          <p className="text-black">23061946</p>
        </div>
        <div className="flex gap-x-8">
          <p className="max-w-32 min-w-32">IC/Passport</p>
          <p className="text-black">010101-01-0101</p>
        </div>
        <div className="flex gap-x-8">
          <p className="max-w-32 min-w-32">Programme</p>
          <p className="text-black">Bachelor of Software Engineering (Hons)hhhhhhhhhh hhhhhhhhhhhhhhhhhhhhhhhhhhhh</p>
        </div>
      </div>
      <div className="flex flex-col text-gray-davy font-bold max-w-112 w-full gap-y-4">
        <div className="flex gap-x-8">
          <p className="max-w-32 min-w-32">Intake</p>
          <p className="text-black">202509</p>
        </div>
        <div className="flex gap-x-8">
          <p className="max-w-32 min-w-32">Study Mode</p>
          <p className="text-black">Full Time</p>
        </div>
        <div className="flex gap-x-8">
          <p className="max-w-32 min-w-32">Semester</p>
          <p className="text-black">4</p>
        </div>
        <div className="flex gap-x-8">
          <p className="max-w-32 min-w-32">Semester Period</p>
          <p className="text-black">22 Sep 2025 - 16 Jan 2026hhhhhhhhhhhhhhhhhhhhhhhhh</p>
        </div>
      </div>
    </div>

  );
}