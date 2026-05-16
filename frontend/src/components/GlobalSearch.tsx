"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { globalSearch, type SearchResult } from "@/lib/api";

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const data = await globalSearch(q, 10);
      setResults(data.results);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else { setQuery(""); setResults([]); }
  }, [open]);

  const typeHref = (r: SearchResult) => {
    if (r.type === "customer") return `/customers/${r.id}`;
    if (r.type === "deal") return `/deals/${r.id}`;
    return `/activities`;
  };

  const typeColor: Record<string, string> = {
    customer: "bg-[#F1EEF8] text-[#7660A8]",
    deal: "bg-[#E6F4EC] text-[#2E8B57]",
    activity: "bg-[#F2F2F4] text-[#7A7A85]",
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-[#E8E8EC] bg-white px-3 py-1.5 text-sm text-[#7A7A85] hover:border-[#C9C0DE] transition-all duration-[240ms]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        Search
        <kbd className="rounded border border-[#E8E8EC] bg-[#F2F2F4] px-1 text-xs">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-lg rounded-2xl border border-[#E8E8EC] bg-white shadow-[0_18px_40px_rgba(15,15,18,0.10)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-[#E8E8EC] px-4 py-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A7A85" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers, deals, activities…"
            className="flex-1 bg-transparent text-sm text-[#0F0F12] placeholder-[#A3A3AC] outline-none"
          />
          {loading && <span className="text-xs text-[#7A7A85]">...</span>}
        </div>

        {results.length > 0 && (
          <ul className="max-h-80 overflow-y-auto p-2">
            {results.map((r) => (
              <li key={`${r.type}-${r.id}`}>
                <button
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-[#F8F8FA] transition-all duration-[240ms]"
                  onClick={() => { router.push(typeHref(r)); setOpen(false); }}
                >
                  <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${typeColor[r.type] ?? ""}`}>{r.type}</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-[#0F0F12]">{r.title}</p>
                    <p className="truncate text-xs text-[#7A7A85]">{r.subtitle}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {query && !loading && results.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-[#7A7A85]">No results for &ldquo;{query}&rdquo;</p>
        )}

        {!query && (
          <p className="px-4 py-6 text-center text-sm text-[#A3A3AC]">Type to search across customers, deals, and activities</p>
        )}
      </div>
    </div>
  );
}
