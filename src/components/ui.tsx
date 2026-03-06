import clsx from "clsx";
import type { ComponentProps } from "react";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={clsx("rounded-xl border border-zinc-800 bg-zinc-950/50 p-4", className)} {...props} />;
}

export function Button({
  className,
  variant = "solid",
  ...props
}: ComponentProps<"button"> & { variant?: "solid" | "ghost" }) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition",
        variant === "solid" && "bg-zinc-50 text-zinc-950 hover:bg-zinc-200",
        variant === "ghost" && "border border-zinc-800 bg-transparent text-zinc-200 hover:border-zinc-600",
        className
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={clsx(
        "w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={clsx(
        "min-h-24 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={clsx(
        "w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 focus:border-zinc-600 focus:outline-none",
        className
      )}
      {...props}
    />
  );
}

export function Pill({ className, ...props }: ComponentProps<"span">) {
  return <span className={clsx("inline-flex items-center rounded-full border border-zinc-700 px-2 py-1 text-xs text-zinc-200", className)} {...props} />;
}

export function Table({ className, ...props }: ComponentProps<"table">) {
  return <table className={clsx("w-full border-collapse text-sm", className)} {...props} />;
}

export function Th({ className, ...props }: ComponentProps<"th">) {
  return <th className={clsx("px-2 py-2 text-left text-xs font-semibold text-zinc-300", className)} {...props} />;
}

export function Td({ className, ...props }: ComponentProps<"td">) {
  return <td className={clsx("px-2 py-2 align-top", className)} {...props} />;
}
