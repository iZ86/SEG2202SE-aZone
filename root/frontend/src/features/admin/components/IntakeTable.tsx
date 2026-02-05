import { Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "@components/Pagination";
import SmallButton from "@components/SmallButton";
import { deleteIntakeByIdAPI } from "../api/intakes";
import type { Intake } from "@datatypes/intakeType";
import { getAllIntakesAPI } from "../api/intakes";
import { useAdmin } from "../hooks/useAdmin";
import LoadingOverlay from "@components/LoadingOverlay";
import { toast } from "react-toastify";

export default function IntakeTable() {
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const navigate = useNavigate();
  const { authToken, admin, loading } = useAdmin();

  const fetchIntakes = useCallback(
    async (token: string, page: number = 1) => {
      const response: Response | undefined = await getAllIntakesAPI(
        token,
        pageSize,
        page,
        searchTerm,
      );

      if (!response || !response.ok) {
        setIntakes([]);
        return;
      }

      const { data } = await response.json();

      if (!data.intakes || data.intakes.length === 0) {
        setIntakes([]);
        return;
      }

      setIntakes(data.intakes);
      setTotalPages(Math.ceil(data.intakeCount / pageSize));
    },
    [searchTerm, pageSize],
  );

  useEffect(() => {
    if (!authToken) return;
    fetchIntakes(authToken, currentPage);
  }, [authToken, currentPage, fetchIntakes]);

  if (loading || !admin) {
    return <LoadingOverlay />;
  }

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleDelete = async (intakeId: number) => {
    if (!authToken) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete Intake ID ${intakeId}?`,
    );
    if (!confirmDelete) return;

    const response = await deleteIntakeByIdAPI(authToken, intakeId);
    if (response && response.ok) {
      navigate("/admin/intakes");
      fetchIntakes(authToken, currentPage);
      toast.success(`Delete intake ${intakeId}`);
      return;
    } else {
      toast.error(`Failed to delete intake ${intakeId}`);
      return;
    }
  };

  return (
    <>
      <div className="items-center space-x-4 mt-4 sm:flex">
        <input
          type="text"
          placeholder="Search with Intake ID..."
          className="w-full sm:w-0 sm:grow px-4 py-2 rounded-md border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-400 text-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="mt-4 sm:mt-0">
          <SmallButton
            buttonText="Create New Intake"
            backgroundColor="bg-blue-500"
            hoverBgColor="hover:bg-blue-600"
            link="/admin/intakes/create"
            textColor="text-white"
            submit={false}
          />
        </div>
      </div>

      <section className="mt-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="h-75 overflow-y-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 text-slate-500">
                <tr className="text-sm">
                  <th className="px-6 py-4 font-medium">Intake ID</th>
                  <th className="px-6 py-4 font-medium">Edit</th>
                  <th className="px-6 py-4 font-medium">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {intakes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500">
                      No intake found.
                    </td>
                  </tr>
                )}
                {intakes.map((intake) => (
                  <tr key={`${intake.intakeId}`} className="text-sm">
                    <td className="px-6 py-5">{intake.intakeId}</td>
                    <td className="px-6 py-5 text-slate-500">
                      <Link
                        to={`/admin/intakes/${intake.intakeId}/edit`}
                        className="text-indigo-600 hover:text-indigo-500 hover:underline"
                      >
                        <Pencil size={16} className="inline-block ml-1" />
                      </Link>
                    </td>
                    <td className="px-6 py-5 text-slate-500">
                      <button
                        onClick={() => handleDelete(intake.intakeId)}
                        className="text-red-600 hover:text-red-500 hover:underline cursor-pointer"
                      >
                        <Trash2 size={16} className="inline-block ml-1" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {totalPages && (
          <div className="mt-4 flex justify-end">
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </section>
    </>
  );
}
