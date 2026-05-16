export default function AdminInputFieldWrapper({
  isEmpty,
  isInvalid,
  invalidMessage,
  children,
}: {
  isEmpty: boolean;
  isInvalid?: boolean;
  invalidMessage?: string | string[];
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-full">
      {children}
      {isEmpty && (
        <p className="text-red-tomato pl-2">This field is required.</p>
      )}
      {isInvalid && invalidMessage && (
        Array.isArray(invalidMessage)
          ? invalidMessage.map((msg, index) => (
              <p className="text-red-tomato pl-2">{msg}</p>
            ))
          : <p className="text-red-tomato pl-2">{invalidMessage}</p>
      )}
    </div>
  );
}
