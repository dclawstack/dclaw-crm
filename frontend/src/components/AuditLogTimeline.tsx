"use client";

import { useEffect, useState } from "react";
import { getAuditLog, type AuditLogEntry } from "@/lib/api";

interface Props {
  entityType: string;
  entityId: string;
}

export default function AuditLogTimeline({ entityType, entityId }: Props) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    getAuditLog(entityType, entityId).then((data) => setEntries(data.items));
  }, [open, entityType, entityId]);

  const actionBadge = (action: string) => {
    if (action === "created") return "bg-[#E6F4EC] text-[#2E8B57]";
    if (action === "deleted") return "bg-[#FBE9E7] text-[#B3261E]";
    return "bg-[#F1EEF8] text-[#7660A8]";
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm font-medium text-[#7660A8] hover:text-[#5C4A8E] transition-colors"
      >
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          className={`transition-transform ${open ? "rotate-90" : ""}`}
        >
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        History
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {entries.length === 0 && (
            <p className="text-xs text-[#7A7A85]">No history yet.</p>
          )}
          {entries.map((e) => (
            <div key={e.id} className="flex items-start gap-3 text-xs">
              <span className={`mt-0.5 rounded-md px-1.5 py-0.5 font-medium ${actionBadge(e.action)}`}>{e.action}</span>
              <div className="flex-1">
                {e.field_name ? (
                  <span className="text-[#404049]">
                    <span className="font-medium">{e.field_name}</span>
                    {e.old_value && <span className="text-[#7A7A85]"> {e.old_value} → </span>}
                    {e.new_value && <span className="text-[#7660A8]">{e.new_value}</span>}
                  </span>
                ) : (
                  <span className="text-[#7A7A85]">{e.entity_type} {e.action}</span>
                )}
              </div>
              <span className="text-[#A3A3AC] whitespace-nowrap">{new Date(e.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
