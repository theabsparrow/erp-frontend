export function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f0f13] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name === "Revenue" ? `$${Number(p.value).toFixed(2)}` : p.value}{" "}
          <span className="text-slate-500 font-normal">
            {p.name === "Revenue" ? "revenue" : "sales"}
          </span>
        </p>
      ))}
    </div>
  );
}