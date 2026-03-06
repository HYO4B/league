import clsx from "clsx";
import type { ComponentProps } from "react";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur",
        className
      )}
      {...props}
    />
  );
}

export function Button({
  className,
  variant = "solid",
  ...props
}: ComponentProps<"button"> & { variant?: "solid" | "ghost" }) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-base font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-400/40",
        variant === "solid" &&
          "bg-gradient-to-b from-zinc-50 to-zinc-200 text-zinc-950 shadow hover:from-white hover:to-zinc-200 active:translate-y-px",
        variant === "ghost" &&
          "border border-zinc-800 bg-zinc-950/40 text-zinc-100 hover:border-zinc-600 hover:bg-zinc-900/40",
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
        "w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2.5 text-base text-zinc-50 placeholder:text-zinc-500 focus:border-sky-400/60 focus:outline-none focus:ring-2 focus:ring-sky-400/20",
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
        "min-h-28 w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2.5 text-base text-zinc-50 placeholder:text-zinc-500 focus:border-sky-400/60 focus:outline-none focus:ring-2 focus:ring-sky-400/20",
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
        "w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2.5 text-base text-zinc-50 focus:border-sky-400/60 focus:outline-none focus:ring-2 focus:ring-sky-400/20",
        className
      )}
      {...props}
    />
  );
}

export function Pill({
  className,
  tone = "neutral",
  ...props
}: ComponentProps<"span"> & { tone?: "neutral" | "sky" | "indigo" | "green" | "amber" }) {
  const tones: Record<string, string> = {
    neutral: "border-zinc-700/80 bg-zinc-950/40 text-zinc-200",
    sky: "border-sky-500/30 bg-sky-500/10 text-sky-200",
    indigo: "border-indigo-500/30 bg-indigo-500/10 text-indigo-200",
    green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-200"
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
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
