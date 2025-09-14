import * as React from "react";

export function Button({ children, className = "", ...props }) {
    return (
      <button
        className={`text-black font-semibold px-6 py-2 rounded-lg shadow transition duration-200 ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
  
