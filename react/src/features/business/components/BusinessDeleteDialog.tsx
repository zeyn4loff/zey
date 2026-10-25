import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function BusinessDeleteDialog({ name, detail, blocked = false, onClose, onDelete }: { name: string; detail?: string; blocked?: boolean; onClose: () => void; onDelete: () => void }) {
  return <Dialog open onOpenChange={(next) => { if (!next) onClose(); }}><DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-3xl p-5 sm:p-7" showCloseButton={false}>
    <DialogTitle className="text-xl font-bold">Silməyi təsdiqləyin</DialogTitle><p className="break-words text-sm leading-6 text-slate-600">“{name}” silinəcək. {detail}</p>
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="min-h-11 cursor-pointer rounded-xl bg-slate-100 px-5 text-sm font-semibold">İmtina</button><button type="button" disabled={blocked} onClick={onDelete} className="min-h-11 cursor-pointer rounded-xl bg-red-600 px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Sil</button></div>
  </DialogContent></Dialog>;
}
