import React from "react";

interface ProcessingSpinnerProps {
  size?: number;
  color?: string;
  text?: string;
  radius?: number;
}

const ProcessingSpinner: React.FC<ProcessingSpinnerProps> = ({
  size = 5,
  color = "currentColor",
  text,
  radius = 10,
}) => {
  return (
    <div className="flex items-center">
      <svg
        className={`mr-3 h-${size} w-${size} animate-spin`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r={radius}
          stroke={color}
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill={color}
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {text && <span>{text}</span>}
    </div>
  );
};

export default ProcessingSpinner;