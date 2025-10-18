import type { LucideIcon } from "lucide-react";

/** 
 * default width is full.
 * default minWidth is 48.
 * default maxWidth is 74.
 */
export default function NormalTextField({
  text, onChange, isInvalid, placeholder, Icon = undefined, width = "full", minWidth = "48", maxWidth = "74"
}: {
  text: string, onChange: (value: string) => void, isInvalid: boolean, placeholder: string, Icon?: LucideIcon, width?: string, minWidth?: string, maxWidth?: string
}) {

  return (
    <div>
      <div className={`relative w-${width} max-w-${maxWidth} min-w-${minWidth} text-base text-gray-battleship`}>
        <input value={text} type="text" className={`min-h-12 w-${width} max-w-${maxWidth} min-w-${minWidth} rounded-2xl border-2 px-4 outline-hidden peer
                    ${text.length === 0 ? (isInvalid ? "border-red-tomato" :
            "border-gray-battleship focus:border-blue-air-superiority focus:text-blue-air-superiority") :
            (isInvalid ? "border-red-tomato text-red-tomato"
              : "border-blue-air-superiority text-blue-air-superiority")}`} onChange={(e) => onChange(e.target.value)}
        />
        <div className={`flex justify-center items-center gap-x-2 absolute left-3 bg-white px-1 pointer-events-none
                    ${text.length === 0 ? (`top-3 transition-all peer-focus:-top-3 ${isInvalid ? "text-red-tomato" : "peer-focus:text-blue-air-superiority"}`)
            : (`peer-focus:transition-all -top-3 ${isInvalid ? "text-red-tomato" : "text-blue-air-superiority"}`)
          }`}
        >
          {Icon ? <Icon /> : undefined}
          <span>{placeholder}</span>
        </div>

      </div>
    </div>

  );
}
