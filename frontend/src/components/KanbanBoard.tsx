"use client";

import { useState } from "react";
import Link from "next/link";
import { moveDealStage, type Deal } from "@/lib/api";

const STAGES = [
  { key: "prospecting", label: "Prospecting" },
  { key: "qualification", label: "Qualification" },
  { key: "proposal", label: "Proposal" },
  { key: "negotiation", label: "Negotiation" },
  { key: "closed_won", label: "Closed Won" },
  { key: "closed_lost", label: "Closed Lost" },
];

interface Props {
  deals: Deal[];
  onDealMoved: () => void;
}

function scoreColor(score: number) {
  if (score >= 70) return "bg-[#F1EEF8] text-[#7660A8]";
  if (score >= 40) return "bg-[#FBF1DC] text-[#C28A00]";
  return "bg-[#FBE9E7] text-[#B3261E]";
}

export default function KanbanBoard({ deals, onDealMoved }: Props) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const byStage = (stage: string) => deals.filter((d) => d.stage === stage);
  const stageTotal = (stage: string) => byStage(stage).reduce((s, d) => s + d.value, 0);

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData("dealId", dealId);
    setDragging(dealId);
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    setDragOver(stage);
  };

  const handleDrop = async (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("dealId");
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === stage) { setDragging(null); setDragOver(null); return; }
    try {
      await moveDealStage(dealId, stage);
      onDealMoved();
    } catch {
      // stage move failed
    }
    setDragging(null);
    setDragOver(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map((s) => {
        const stageDeals = byStage(s.key);
        const isWon = s.key === "closed_won";
        return (
          <div
            key={s.key}
            className={`flex-shrink-0 w-64 rounded-2xl border transition-all duration-[240ms] ${dragOver === s.key ? "border-[#C9C0DE] bg-[#F8F6FB]" : "border-[#E8E8EC] bg-[#F8F8FA]"}`}
            onDragOver={(e) => handleDragOver(e, s.key)}
            onDrop={(e) => handleDrop(e, s.key)}
            onDragLeave={() => setDragOver(null)}
          >
            <div className={`rounded-t-2xl px-4 py-3 border-b border-[#E8E8EC] ${isWon ? "bg-[#E6F4EC]" : "bg-white"}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#7A7A85]">{s.label}</span>
                <span className="rounded-full bg-[#F2F2F4] px-2 py-0.5 text-xs font-medium text-[#7A7A85]">{stageDeals.length}</span>
              </div>
              <p className="mt-0.5 text-xs text-[#A3A3AC]">${stageTotal(s.key).toLocaleString()}</p>
            </div>
            <div className="space-y-2 p-3 min-h-[120px]">
              {stageDeals.map((deal) => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, deal.id)}
                  className={`rounded-xl border border-[#E8E8EC] bg-white p-3 cursor-grab shadow-[0_2px_6px_rgba(15,15,18,0.06)] hover:shadow-[0_8px_20px_rgba(15,15,18,0.08)] transition-all duration-[240ms] ${dragging === deal.id ? "opacity-50" : ""}`}
                >
                  <Link href={`/deals/${deal.id}`} className="block hover:no-underline" onClick={(e) => e.stopPropagation()}>
                    <p className="text-sm font-semibold text-[#0F0F12] truncate">{deal.title}</p>
                    <p className="text-xs text-[#7A7A85] truncate">{deal.customer.name}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-[#404049]">${deal.value.toLocaleString()}</span>
                      <span className="rounded-full bg-[#F1EEF8] px-2 py-0.5 text-xs text-[#7660A8]">{deal.probability}%</span>
                    </div>
                  </Link>
                </div>
              ))}
              {stageDeals.length === 0 && (
                <div className="flex h-16 items-center justify-center rounded-xl border-2 border-dashed border-[#E8E8EC]">
                  <span className="text-xs text-[#A3A3AC]">Drop here</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
