import type { ChangeEvent, HTMLInputTypeAttribute } from "react";
import InputErrorComponent from "./input-errors";

export type GivingInputProps = {
  type?: HTMLInputTypeAttribute;
  name?: string;
  displayName?: string;
  value?: string | number;
  error?: string;
  placeholder?: string;
  min?: number | string;
  autoComplete?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

/** Floating-label input used across the giving form. */
export const GivingInputComponent = ({
  type,
  name,
  displayName,
  value,
  error,
  placeholder,
  min,
  autoComplete,
  onChange,
}: GivingInputProps) => (
  <div>
    <div className="flex flex-col gap-y-2 relative">
      <input
        id={name}
        type={type}
        name={name}
        className="block px-2.5 pb-2.5 pt-3 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-maroon-600 peer"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={onChange}
        autoComplete={autoComplete}
        min={min}
      />
      <label
        htmlFor={name}
        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-maroon-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1 cursor-text"
      >
        {displayName || name}
      </label>
    </div>
    <InputErrorComponent error={error} />
  </div>
);
