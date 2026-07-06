import { useState, type ChangeEvent } from "react";
import { api } from "./api";

function thisMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// Minimal CSV parse (comma-separated, header row). Finds the B/L + company columns
// by header name so the counterparty's export layout can vary a bit.
function parseCsv(text: string): { bl_number: string; company?: string }[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  const split = (l: string) => l.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
  const header = split(lines[0]).map((h) => h.toLowerCase());
  const blIdx = header.findIndex((h) => /b.?l|bill|no\.?$/.test(h));
  const coIdx = header.findIndex((h) => /company|name|perusahaan|customer/.test(h));
  // If no recognizable header, treat the first column as B/L and skip no rows.
  const hasHeader = blIdx >= 0 || coIdx >= 0;
  const bi = blIdx >= 0 ? blIdx : 0;
  const rows = (hasHeader ? lines.slice(1) : lines).map((l) => {
    const c = split(l);
    return { bl_number: c[bi] || "", company: coIdx >= 0 ? c[coIdx] : undefined };
  });
  return rows.filter((r) => r.bl_number);
}

export function Reconciliation() {
  const [month, setMonth] = useState(thisMonth());
  const [csv, setCsv] = useState("");
  const [res, setRes] = useState<any>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setErr(""); setBusy(true); setRes(null);
    try {
      const rows = parseCsv(csv);
      if (rows.length === 0) throw new Error("CSV kosong / tidak ada kolom B/L terdeteksi.");
      setRes(await api.reconcile(month, rows));
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  };

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    f.text().then(setCsv);
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h2 className="text-sm font-bold mb-1">Rekonsiliasi Laporan Pihak Pertama</h2>
        <p className="text-xs text-zinc-500">Tempel/unggah CSV laporan mereka (harus ada kolom B/L). Dicocokkan dengan Kontainer Terkirim kita bulan itu.</p>
      </div>

      <div className="flex items-end gap-3">
        <div>
          <label className="block text-[11px] text-zinc-500 mb-1">Bulan (YYYY-MM)</label>
          <input value={month} onChange={(e) => setMonth(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
        </div>
        <input type="file" accept=".csv,text/csv" onChange={onFile} className="text-xs text-zinc-400" />
      </div>

      <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={6}
        placeholder={"bl_number,company\nBL-QA-001,Doha Coal\n..."}
        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-orange-500" />

      <button onClick={run} disabled={busy} className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-sm font-semibold disabled:opacity-50">
        {busy ? "…" : "Cocokkan"}
      </button>

      {err && <p className="text-red-400 text-sm">{err}</p>}

      {res && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="text-emerald-400">Match: <b>{res.matched}</b></span>
            <span className="text-zinc-400">CRM kita: {res.our_total} · Laporan mereka: {res.their_total}</span>
          </div>

          <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-4">
            <h3 className="text-xs font-bold text-red-300 uppercase tracking-wide mb-2">
              ⚠ Ada di CRM, TIDAK di laporan mereka ({res.unmatched_ours.length}) — potensi komisi belum dibayar
            </h3>
            {res.unmatched_ours.length === 0 ? <p className="text-zinc-500 text-sm">Tidak ada — semua B/L kita terlaporkan. 👍</p> : (
              <ul className="text-sm space-y-1">
                {res.unmatched_ours.map((r: any, i: number) => (
                  <li key={i} className="text-red-200">{r.bl_number} · {r.company} · {r.containers} kontainer</li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2">
              Ada di laporan mereka, bukan Customer Digital kita ({res.unmatched_theirs.length}) — normal / perlu dicek
            </h3>
            {res.unmatched_theirs.length === 0 ? <p className="text-zinc-500 text-sm">Tidak ada.</p> : (
              <ul className="text-sm space-y-1">
                {res.unmatched_theirs.map((r: any, i: number) => (
                  <li key={i} className="text-zinc-400">{r.bl_number}{r.company ? " · " + r.company : ""}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
