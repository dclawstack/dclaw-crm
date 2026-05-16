"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

interface ImportResult { imported: number; skipped: number; errors: string[]; }

interface Props {
  label: string;
  onImport: (file: File) => Promise<ImportResult>;
  onExport: () => Promise<Response>;
  exportFilename: string;
}

export default function ImportModal({ label, onImport, onExport, exportFilename }: Props) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const res = await onImport(file);
      setResult(res);
    } catch (e) {
      setResult({ imported: 0, skipped: 0, errors: [String(e)] });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    const resp = await onExport();
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExport}>Export CSV</Button>
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setResult(null); }}>
        <DialogTrigger>
          <Button variant="outline" size="sm">Import CSV</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Import {label}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <input ref={fileRef} type="file" accept=".csv" className="block w-full text-sm text-[#404049] file:mr-4 file:rounded-lg file:border-0 file:bg-[#F1EEF8] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#7660A8]" />
            <Button onClick={handleImport} disabled={loading} className="bg-[#7660A8] hover:bg-[#5C4A8E] text-white rounded-full">
              {loading ? "Importing…" : "Import"}
            </Button>
            {result && (
              <div className="rounded-xl border border-[#E8E8EC] p-3 text-sm space-y-1">
                <p className="text-[#2E8B57]">✓ {result.imported} imported</p>
                {result.skipped > 0 && <p className="text-[#C28A00]">⚠ {result.skipped} skipped</p>}
                {result.errors.slice(0, 5).map((e, i) => (
                  <p key={i} className="text-xs text-[#B3261E]">{e}</p>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
