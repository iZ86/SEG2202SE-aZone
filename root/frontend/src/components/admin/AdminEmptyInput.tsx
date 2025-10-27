export default function AdminEmptyInput({
  isInvalid,
  children,
}: {
  isInvalid: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
      {isInvalid && (
        <p className="text-red-tomato pl-2">This field is required.</p>
      )}
    </div>
  );
}
