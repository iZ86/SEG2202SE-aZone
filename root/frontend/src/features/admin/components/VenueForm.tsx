import LoadingOverlay from "@components/LoadingOverlay";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import MediumButton from "@components/MediumButton";
import NormalTextField from "@components/NormalTextField";
import AdminInputFieldWrapper from "@components/admin/AdminInputFieldWrapper";
import {
  createVenueAPI,
  getVenueByIdAPI,
  updateVenueByIdAPI,
} from "../api/venues";
import { toast } from "react-toastify";

export default function VenueForm({
  type,
  id = 0,
}: {
  type: "Add" | "Edit";
  id?: number;
}) {
  const [venue, setVenue] = useState("");

  const [emptyVenue, setEmptyVenue] = useState(false);

  const [invalidVenue, setInvalidVenue] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    if (emptyVenue) {
      setIsLoading(false);
      return;
    }

    if (setEmptyInputs()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let response: Response | undefined;

    if (type === "Add") {
      response = await createVenueAPI(authToken as string, venue);
    } else if (type === "Edit") {
      response = await updateVenueByIdAPI(authToken as string, id, venue);
    }

    if (response && response.status === 409) {
      setIsLoading(false);
      setInvalidVenue(true);
      toast.error("Venue Existed");
      return;
    }

    if (response && response.ok) {
      setIsLoading(false);
      navigate("/admin/venues");
      toast.success(`${type === "Add" ? "Created new" : "Updated"} venue`);
      return;
    }
  }

  function setEmptyInputs(): boolean {
    let emptyInput: boolean = false;

    if (!venue) {
      setEmptyVenue(true);
      emptyInput = true;
    }

    return emptyInput;
  }

  function onChangeVenue(onChangeVenue: string) {
    if (onChangeVenue !== "") {
      setEmptyVenue(false);
    }
    setVenue(onChangeVenue);
  }

  const setupEditVenueForm = useCallback(
    async (token: string, venueId: number) => {
      const response: Response | undefined = await getVenueByIdAPI(
        token,
        venueId
      );

      if (!response?.ok) {
        navigate("/admin/venues");
        toast.error("Failed to fetch venue");
        return;
      }
      const { data } = await response.json();

      setVenue(data.venue);
    },
    [navigate]
  );

  useEffect(() => {
    const token: string = (localStorage.getItem("aZoneAdminAuthToken") ||
      sessionStorage.getItem("aZoneAdminAuthToken")) as string;

    if (!token) {
      navigate("/admin/login");
      return;
    }

    setAuthToken(token);

    if (type === "Edit" && id > 0) {
      setupEditVenueForm(token, id);
    }
  }, [navigate, type, id, setupEditVenueForm]);

  return (
    <section className="flex-1 bg-white rounded-lg border">
      {isLoading && <LoadingOverlay />}
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex flex-col w-full px-10 py-6">
          <h1 className="text-3xl font-bold text-slate-900">
            {type === "Edit" ? "Edit" : "Create New"} Venue
          </h1>
          <p className="mt-1 text-slate-400">
            {type === "Edit"
              ? "Make changes to the venue information below."
              : "Fill in the details below to create a new venue."}
          </p>
        </div>

        <hr className="border-slate-200 w-full border" />

        <div className="flex flex-col px-10 py-6 justify-center items-center">
          <form onSubmit={handleSubmit} className="mt-6 gap-y-8 flex flex-col">
            <div className="flex w-5xl gap-x-10">
              <div className="flex-1">
                <AdminInputFieldWrapper
                  isEmpty={emptyVenue}
                  isInvalid={invalidVenue}
                  invalidMessage="Venue existed"
                >
                  <NormalTextField
                    text={venue}
                    onChange={onChangeVenue}
                    isInvalid={emptyVenue || invalidVenue}
                    placeholder="Venue Name"
                  />
                </AdminInputFieldWrapper>
              </div>
            </div>

            <div className="justify-center flex mt-10 gap-x-10">
              <MediumButton
                buttonText="Cancel"
                submit={false}
                backgroundColor="bg-slate-400"
                hoverBgColor="hover:bg-slate-600"
                textColor="text-white"
                link="/admin/venues"
              />
              <MediumButton
                buttonText={
                  type === "Edit" ? "Save Changes" : "Create New Venue"
                }
                submit={true}
                backgroundColor="bg-blue-500"
                hoverBgColor="hover:bg-blue-600"
                textColor="text-white"
              />
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
