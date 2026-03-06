import clsx from "clsx";
import type { ComponentProps } from "react";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={clsx("rounded-xl border border-zinc-800 bg-zinc-950/50 p-5", className)} {...props} />;
}

export function Button({
  className,
  variant = "solid",
  ...props
}: ComponentProps<"button"> & { variant?: "solid" | "ghost" }) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-base font-semibold transition",
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
        "w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-base text-zinc-50 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none",
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
        "min-h-28 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-base text-zinc-50 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none",
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
        "w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-base text-zinc-50 focus:border-zinc-600 focus:outline-none",
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
  return <table className={clsx("w-full border-collapse text-base", className)} {...props} />;
}

export function Th({ className, ...props }: ComponentProps<"th">) {
  return <th className={clsx("px-3 py-2.5 text-left text-sm font-semibold text-zinc-300", className)} {...props} />;
}

export function Td({ className, ...props }: ComponentProps<"td">) {
  return <td className={clsx("px-3 py-2.5 align-top", className)} {...props} />;
}
