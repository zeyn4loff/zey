import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { content, type LegalTab } from "./legalContent";
interface Props { tab: LegalTab | null; onTabChange: (tab: LegalTab | null) => void }

export default function LegalModal({ tab, onTabChange }: Props) {
  return <Dialog open={tab !== null} onOpenChange={(open) => { if (!open) onTabChange(null); }}>
    <DialogContent className="customer-modal max-h-[85vh] w-[calc(100vw-2rem)] overflow-y-auto rounded-3xl border-0 p-6 shadow-2xl sm:max-w-xl" overlayClassName="customer-overlay">
      <DialogHeader><DialogTitle className="text-lg font-bold">{tab ? content[tab].title : "Hüquqi məlumat"}</DialogTitle><p className="text-xs text-slate-500">Hüquqi məlumat</p></DialogHeader>
      <div role="tablist" aria-label="Hüquqi məlumat" className="flex rounded-xl bg-slate-100 p-1">
        {(["terms", "privacy"] as const).map((value) => <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => onTabChange(value)} className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${tab === value ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}>{value === "terms" ? "Şərtlər" : "Məxfilik"}</button>)}
      </div>
      {tab && <div role="tabpanel" className="max-h-[45vh] space-y-3 overflow-y-auto text-sm leading-relaxed text-slate-600">{content[tab].paragraphs.map((paragraph) => <p key={paragraph} className="rounded-xl border border-slate-100 bg-slate-50 p-3">{paragraph}</p>)}</div>}
      <button type="button" onClick={() => onTabChange(null)} className="h-10 rounded-xl bg-yellow-primary px-5 text-sm font-semibold">Bağla</button>
    </DialogContent>
  </Dialog>;
}
