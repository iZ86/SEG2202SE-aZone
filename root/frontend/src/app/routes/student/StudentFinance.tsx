import StudentNavbar from "@components/student/StudentNavbar";
import FeesSummary from "@features/finance/components/FeesSummary";
import StudentInformationPanelExtended from "@features/student/components/StudentInformationPanelExtended";

export default function StudentFinance() {
  return (
    <div className="flex flex-col min-h-screen bg-white-antiflash">
      <StudentNavbar page="finance" />
      <div className="mx-6 my-12">
        <div className="flex flex-col gap-y-12 w-full max-w-256 mx-auto">
          <h1 className="font-bold text-black">Fees Summary</h1>
          <StudentInformationPanelExtended />
          <FeesSummary />

        </div>

      </div>


    </div>
  );
}
