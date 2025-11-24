import AdminInputFieldWrapper from "@components/admin/AdminInputFieldWrapper";
import LoadingOverlay from "@components/LoadingOverlay";
import NormalTextField from "@components/NormalTextField";
import SmallButton from "@components/SmallButton";
import {
  updateProfilePictureAPI,
  uploadBlobAPI,
} from "@features/general/api/storage";
import { updateMeAPI } from "../../general/api/user";
import { Mail, Phone, User } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { toast } from "react-toastify";
import { useAdmin } from "../hooks/useAdmin";

export default function ProfileForm() {
  const { authToken, admin, loading } = useAdmin();
  const [userId, setUserId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [emailInput, setEmailInput] = useState("");
  const [phoneNumberInput, setPhoneNumberInput] = useState("");

  const [emptyEmailInput, setEmptyEmailInput] = useState(false);
  const [emptyPhoneNumberInput, setEmptyPhoneNumberInput] = useState(false);
  const [emptyFile, setEmptyFile] = useState(false);

  const [invalidFile, setInvalidFile] = useState(false);

  const [isPictureUploading, setIsPictureUploading] = useState(false);
  const [isUserInformationUpadting, setIsUserInformationUpdating] =
    useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setEmptyFile(false);
      setInvalidFile(false);

      if (fileRejections.length > 0) {
        setInvalidFile(true);
        setSelectedFile(null);
        return;
      }

      if (acceptedFiles.length === 0) {
        setEmptyFile(true);
        return;
      }

      setSelectedFile(acceptedFiles[0]);
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop,
    maxSize: 2 * 1024 * 1024, // 2MB
  });

  useEffect(() => {
    if (!admin) return;
    setUserId(admin.userId.toString());
    setFirstName(admin.firstName);
    setLastName(admin.lastName);
    setEmailInput(admin.email);
    setEmail(admin.email);
    setPhoneNumberInput(admin.phoneNumber);
    setPhoneNumber(admin.phoneNumber);
    setProfilePictureUrl(admin.profilePictureUrl || "");
  }, [admin]);

  if (loading || !admin) {
    return <LoadingOverlay />;
  }

  async function handleUploadProfilePicture() {
    if (!selectedFile) {
      setEmptyFile(true);
      return;
    }

    setIsPictureUploading(true);

    const newBlob = await uploadBlobAPI(authToken, selectedFile);
    const response = await updateProfilePictureAPI(
      authToken,
      newBlob?.url as string
    );

    if (response && response.ok) {
      const { data } = await response.json();

      setUserId(data.userId);
      setFirstName(data.firstName);
      setLastName(data.lastName);
      setEmail(data.email);
      setPhoneNumber(data.phoneNumber);
      setProfilePictureUrl(data.profilePictureUrl || "");

      toast.success("Profile Picture Uploaded!");
    } else {
      toast.error("Failed to Upload Profile Picture");
    }

    setIsPictureUploading(false);
    setSelectedFile(null);
  }

  async function handleUpdateProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isUserInformationUpadting) {
      return;
    }

    if (emptyEmailInput || emptyPhoneNumberInput) {
      setIsUserInformationUpdating(false);
      return;
    }

    if (setEmptyInputs()) {
      setIsUserInformationUpdating(false);
      return;
    }

    setIsUserInformationUpdating(true);

    const response = await updateMeAPI(authToken, emailInput, phoneNumberInput);

    if (response && response.ok) {
      const { data } = await response.json();

      setEmail(data.email);
      setPhoneNumber(data.phoneNumber);

      setIsUserInformationUpdating(false);
      toast.success("Information Updated!");
      return;
    } else {
      toast.error("Failed to Update Information");
      return;
    }
  }

  function onChangeEmail(onChangeEmail: string) {
    if (onChangeEmail !== "") {
      setEmptyEmailInput(false);
    }
    setEmailInput(onChangeEmail);
  }

  function onChangePhoneNumber(onChangePhoneNumber: string) {
    if (onChangePhoneNumber !== "") {
      setEmptyPhoneNumberInput(false);
    }
    setPhoneNumberInput(onChangePhoneNumber);
  }

  function setEmptyInputs(): boolean {
    let emptyInput: boolean = false;

    if (emailInput === "") {
      setEmptyEmailInput(true);
      emptyInput = true;
    }

    if (phoneNumberInput === "") {
      setEmptyPhoneNumberInput(true);
      emptyInput = true;
    }

    return emptyInput;
  }

  return (
    <section>
      ;{isPictureUploading && <LoadingOverlay />}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        <div className="lg:col-span-1 lg:col-start-3 lg:row-start-1 bg-white p-6 rounded-xl shadow-lg h-fit order-1 lg:order-2">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Basic Information
          </h3>

          {/* Profile Picture Display */}
          <div className="flex flex-col items-center mb-6">
            <img
              className="w-32 h-32 rounded-full object-cover border-4 border-indigo-400 shadow-md"
              src={profilePictureUrl}
              alt={`${lastName + " " + firstName}'s profile`}
            />
            <p className="text-lg font-bold mt-3 text-gray-900">
              {lastName + " " + firstName}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <User className="w-5 h-5 mr-3 text-indigo-500" />
              <div>
                <div className="text-xs font-medium uppercase">Admin ID</div>
                <div className="text-sm font-semibold text-gray-800 break-all">
                  {userId}
                </div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <Mail className="w-5 h-5 mr-3 text-indigo-500" />
              <div>
                <div className="text-xs font-medium uppercase">Email</div>
                <div className="text-sm font-semibold text-gray-800 break-all">
                  {email}
                </div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <Phone className="w-5 h-5 mr-3 text-indigo-500" />
              <div>
                <div className="text-xs font-medium uppercase">
                  Phone Number
                </div>
                <div className="text-sm font-semibold text-gray-800 break-all">
                  {phoneNumber}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 lg:col-start-1 space-y-8 order-2 lg:order-1">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Change Profile Picture
            </h3>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition mb-4 ${
                isDragActive
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-300 hover:border-indigo-400"
              }`}
            >
              <AdminInputFieldWrapper
                isEmpty={emptyFile}
                isInvalid={invalidFile}
                invalidMessage="Invalid file format, or exceed maximum file size"
              >
                <input {...getInputProps()} />
              </AdminInputFieldWrapper>

              {selectedFile ? (
                <p className="font-medium text-indigo-600 truncate mx-auto">
                  {selectedFile.name}
                </p>
              ) : (
                <p className="text-gray-600">
                  Drag & drop an image here, or click to select
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <SmallButton
                onClick={handleUploadProfilePicture}
                buttonText={
                  isPictureUploading ? "Uploading..." : "Upload & Save"
                }
              />
            </div>
          </div>

          <form
            onSubmit={handleUpdateProfile}
            className="bg-white p-6 rounded-xl shadow-lg flex flex-col"
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Edit Contact Information
            </h3>

            <div className="space-y-6">
              <AdminInputFieldWrapper isEmpty={emptyEmailInput}>
                <NormalTextField
                  text={emailInput}
                  placeholder="Email (e.g., john@example.com)"
                  isInvalid={emptyEmailInput}
                  onChange={onChangeEmail}
                />
              </AdminInputFieldWrapper>

              <AdminInputFieldWrapper isEmpty={emptyPhoneNumberInput}>
                <NormalTextField
                  text={phoneNumberInput}
                  onChange={onChangePhoneNumber}
                  isInvalid={emptyPhoneNumberInput}
                  placeholder="Phone Number (e.g., 0123456789)"
                />
              </AdminInputFieldWrapper>
            </div>

            {/* Submission Button */}
            <div className="mt-8 flex justify-end">
              <SmallButton
                submit={true}
                buttonText={
                  isUserInformationUpadting
                    ? "Saving Changes..."
                    : "Update Information"
                }
              />
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
