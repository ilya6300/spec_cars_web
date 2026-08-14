import React from "react";

/**
 * @param {{
 *   role: "mission" | "nav",
 *   className?: string,
 *   children: import("react").ReactNode,
 * } & import("react").ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export function QuestCtaButton({
  role,
  className = "",
  children,
  type = "button",
  ...rest
}) {
  return (
    <button
      type={type}
      className={`ui-btn ui-btn--bloom ui-btn--${role}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      <span className="ui-btn__label">{children}</span>
    </button>
  );
}
