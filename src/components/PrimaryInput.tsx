/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

type Props = {
  label?: string;
  placeholder: string;
  value: any;
  type?: string;
  setValue: (newValue: any) => void;
  error?: string; // Optional prop to display an error message
  className?: string;
  disabled?: boolean;
  optional?: boolean;
  size?: "small" | "default"; // Add size prop
};

function PrimaryInput({
  label,
  placeholder,
  value,
  setValue,
  type,
  error,
  className,
  disabled,
  optional,
  size = "default", // Default size is 'default'
}: Props) {
  // Define classes for different sizes
  const inputSizeClass =
    size === "small" ? "p-2 text-xs rounded" : "p-3 text-base rounded-xl";

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <p className="text-zinc-950 font-semibold pl-1 pb-2">
          {label} {optional && "(Optional)"}
        </p>
      )}
      {type === "textarea" ? (
        <textarea
          disabled={disabled}
          rows={5}
          className={`border ${inputSizeClass} ${
            error ? "border-red-400" : "border border-zinc-300/50"
          } bg-white text-zinc-600`}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={(e) => setValue(e.target.value)}
        />
      ) : (
        <input
          disabled={disabled}
          type={type === "number" ? "number" : type} // Ensure type is 'number' for numeric input
          className={`border ${inputSizeClass} ${
            error ? "border-red-400" : "border border-zinc-300/50"
          } bg-white text-zinc-600`}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={(e) =>
            setValue(
              type === "number" ? Number(e.target.value) : e.target.value
            )
          } // Convert to number if type is 'number'
        />
      )}
      {error && (
        <p className="text-red-500 text-xs mt-1 pl-1 text-end">{error}</p>
      )}
    </div>
  );
}

export default PrimaryInput;
