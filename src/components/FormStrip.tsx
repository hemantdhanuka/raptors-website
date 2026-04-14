import clsx from "clsx";

const pillStyle: Record<"W" | "L" | "D", string> = {
  W: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  L: "bg-red-500/15 text-red-400 border-red-500/25",
  D: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",
};

interface FormStripProps {
  form: ("W" | "L" | "D")[];
}

export function FormStrip({ form }: FormStripProps) {
  if (!form?.length) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-white/50 uppercase tracking-widest font-medium">Form</span>
      <div className="flex gap-1">
        {form.map((r, i) => (
          <span
            key={i}
            className={clsx(
              "w-7 h-7 flex items-center justify-center rounded border text-xs font-bold",
              pillStyle[r]
            )}
          >
            {r}
          </span>
        ))}
      </div>
    </div>
  );
}
