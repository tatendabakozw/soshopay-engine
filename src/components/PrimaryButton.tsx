import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  outline?: boolean;
  text: string;
  secondary?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  loading?: boolean;
}

const PrimaryButton: React.FC<ButtonProps> = ({
  outline = false,
  text,
  secondary = false,
  onClick,
  loading = false,
}) => {
  const backgroundColor = "bg-zinc-950";
  const textColor = "text-white ";
  const borderColor = "border-zinc-950 ";

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${
        outline
          ? `bg-white ${textColor} border-2 ${borderColor}`
          : `${backgroundColor} ${textColor} border ${borderColor}`
      } rounded-xl px-4 py-3 font-medium flex flex-row items-center`}
    >
      <p className="text-center w-full font-medium text-sm">
        {loading ? "loading... " : text}
      </p>
    </button>
  );
};

export default PrimaryButton;
