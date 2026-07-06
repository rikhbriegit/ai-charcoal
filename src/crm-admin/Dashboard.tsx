import { useEffect, useState } from "react";
import { api, rp } from "./api";

const Stat = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
    <p className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</p>
    <p className={`text-2xl font-black mt-1 ${accent ? "text-orange-500" : "text-zinc-100"}`}>{value}</p>
  </div>
);

const Bars = ({ title, rows }: { title: string; rows: { k: string; n: number }[] }) => {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-3">{title}</h3>
      {rows.length === 0 ? <p className="text-zinc-600 text-sm">-</p> : (
        <div className="space-y-1.5">
          {rows.map((r) => (
            <div key={r.k} className="flex items-center gap-2 text-xs">
              <span className="w-28 shrink-0 text-zinc-400 truncate">{r.k}</span>
              <div className="flex-1 bg-zinc-950 rounded h-4 overflow-hidden">
                <div className="h-full bg-orange-600/70" style={{ width: `${(r.n / max) * 100}%` }} />
              </div>
              <span className="w-8 text-right text-zinc-300">{r.n}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export function Dashboard() {
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState("");
  useEffect(() => { api.dashboard().then(setD).catch((e) => setErr(e.message)); }, []);
  if (err) return <p className="text-red-400">{err}</p>;
  if (!d) return <p className="text-zinc-500">Loading…</p>;

  const trendMax = Math.max(1, ...d.trend.map((t: any) => Number(t.commission)));
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Kontainer Digital" value={String(d.totals.containers)} />
        <Stat label="Komisi Accrued" value={rp(d.commission.accrued)} accent />
        <Stat label="Komisi Invoiced" value={rp(d.commission.invoiced)} />
        <Stat label="Komisi Paid" value={rp(d.commission.paid)} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Bars title="Lead per Kanal" rows={d.leadsByChannel} />
        <Bars title="Pipeline per Stage" rows={d.pipelineByStage} />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-3">Tren 6 Bulan (komisi & kontainer)</h3>
        {d.trend.length === 0 ? <p className="text-zinc-600 text-sm">Belum ada data.</p> : (
          <div className="flex gap-3 h-40">
            {d.trend.map((t: any) => (
              <div key={t.month} className="flex-1 h-full flex flex-col items-center justify-end gap-1">
                <span className="text-[10px] text-zinc-400">{rp(t.commission).replace("Rp", "")}</span>
                <div className="w-full bg-orange-600/70 rounded-t" style={{ height: `${(Number(t.commission) / trendMax) * 100}%`, minHeight: "2px" }} />
                <span className="text-[10px] text-zinc-500">{t.month.slice(5)}</span>
                <span className="text-[10px] text-zinc-600">{t.containers} kont</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
