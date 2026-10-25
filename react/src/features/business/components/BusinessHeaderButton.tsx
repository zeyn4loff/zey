import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary";
};

export default function BusinessHeaderButton({ children, className = "", type = "button", variant = "primary", ...props }: Props) {
  return <button
    {...props}
    type={type}
    className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold leading-5 transition-colors [&>svg]:size-4 [&>svg]:shrink-0 ${variant === "primary" ? "bg-yellow-primary text-[#101114] hover:bg-yellow-300" : "bg-slate-100 text-[#101114] hover:bg-slate-200"} ${className}`}
  >{children}</button>;
}
