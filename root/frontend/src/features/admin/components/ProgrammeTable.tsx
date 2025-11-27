import { Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "@components/Pagination";
import SmallButton from "@components/SmallButton";
import type { Programme } from "@datatypes/programmeType";
import { deleteProgrammeByIdAPI, getAllProgrammesAPI } from "../api/programmes";
import { toast } from "react-toastify";

export default function ProgrammeTable() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const navigate = useNavigate();

  const fetchProgrammes = useCallback(
    async (token: string, page: number = 1) => {
      const response: Response | undefined = await getAllProgrammesAPI(
        token,
        pageSize,
        page,
        searchTerm
      );

      if (!response || !response.ok) {
        setProgrammes([]);
        return;
      }

      const { data } = await response.json();

      if (!data.programmes || data.programmes.length === 0) {
        setProgrammes([]);
        return;
      }

      setProgrammes(data.programmes);
      setTotalPages(Math.ceil(data.programmeCount / pageSize));
    },
    [searchTerm, pageSize]
  );

  useEffect(() => {
    const token: string = (localStorage.getItem("aZoneAdminAuthToken") ||
      sessionStorage.getItem("aZoneAdminAuthToken")) as string;

    if (!token) {
      navigate("/admin/login");
      return;
    }
    setAuthToken(token);
  }, [fetchProgrammes, navigate]);

  useEffect(() => {
    if (!authToken) return;
    fetchProgrammes(authToken, currentPage);
  }, [authToken, currentPage, fetchProgrammes]);

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleDelete = async (programmeId: number) => {
    if (!authToken) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete Programme ID ${programmeId}?`
    );
    if (!confirmDelete) return;

    const response = await deleteProgrammeByIdAPI(authToken, programmeId);
    if (response && response.ok) {
      navigate("/admin/programmes");
      fetchProgrammes(authToken, currentPage);
      toast.success(`Programme ${programmeId} deleted`);
      return;
    } else {
      toast.error(`Failed to delete programme ${programmeId}`);
      return;
    }
  };

  return (
    <>
      <div className="flex items-center space-x-4 mt-4">
        <input
          type="text"
          placeholder="Search with Programme ID, or Programme Name..."
          className="grow px-4 py-2 rounded-md border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-400 text-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <SmallButton
          buttonText="Create New Programme"
          backgroundColor="bg-blue-500"
          hoverBgColor="hover:bg-blue-600"
          link="/admin/programmes/create"
          textColor="text-white"
          submit={false}
        />
      </div>

      <section className="mt-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="h-[300px] overflow-y-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 text-slate-500">
                <tr className="text-sm">
                  <th className="px-6 py-4 font-medium">Programme ID</th>
                  <th className="px-6 py-4 font-medium">Programme Name</th>
                  <th className="px-6 py-4 font-medium">Edit</th>
                  <th className="px-6 py-4 font-medium">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {programmes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500">
                      No programmes found.
                    </td>
                  </tr>
                )}
                {programmes.map((programme) => (
                  <tr key={`${programme.programmeId}`} className="text-sm">
                    <td className="px-6 py-5">{programme.programmeId}</td>
                    <td className="px-6 py-5">{programme.programmeName}</td>
                    <td className="px-6 py-5 text-slate-500">
                      <Link
                        to={`/admin/programmes/${programme.programmeId}/edit`}
                        className="text-indigo-600 hover:text-indigo-500 hover:underline"
                      >
                        <Pencil size={16} className="inline-block ml-1" />
                      </Link>
                    </td>
                    <td className="px-6 py-5 text-slate-500">
                      <button
                        onClick={() => handleDelete(programme.programmeId)}
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
