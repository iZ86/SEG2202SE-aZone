export default function AdminInputFieldWrapper({
  isEmpty,
  isInvalid,
  invalidMessage,
  children,
}: {
  isEmpty: boolean;
  isInvalid?: boolean;
  invalidMessage?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
      {isEmpty && (
        <p className="text-red-tomato pl-2">This field is required.</p>
      )}
      {isInvalid && invalidMessage && (
        <p className="text-red-tomato pl-2">{invalidMessage}</p>
      )}
    </div>
  );
}
