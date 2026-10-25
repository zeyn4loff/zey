import { useEffect, useState, type FormEvent } from "react";
import { useCustomer } from "@/features/customer/useCustomer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { readReviews, saveReviews, type PublicReview } from "../reviews";

export default function LocalReviews({ subject, title }: { subject: string; title: string }) {
  const { user, openReviewAuth } = useCustomer();
  const [reviews, setReviews] = useState<PublicReview[]>(() => readReviews(subject));
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [pendingAuth, setPendingAuth] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const refresh = () => setReviews(readReviews(subject));
    refresh();
    window.addEventListener("zeyvo-marketplace-change", refresh);
    return () => window.removeEventListener("zeyvo-marketplace-change", refresh);
  }, [subject]);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) { setPendingAuth(true); setOpen(false); openReviewAuth(); return; }
    if (!text.trim()) return;
    const next = [{ id: crypto.randomUUID(), name: user.name, email: user.email, rating, text: text.trim(), date: new Date().toLocaleDateString("az-AZ"), status: "published" as const }, ...readReviews(subject)];
    if (saveReviews(subject, next)) {
      setReviews(next);
      setText("");
      setError("");
      setOpen(false);
    } else setError("Rəyi saxlamaq mümkün olmadı. Yenidən cəhd edin.");
  }
  return <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">{title}</h2><button type="button" onClick={() => setOpen(true)} className="rounded-xl bg-yellow-primary px-4 py-2 text-sm font-semibold">Rəy bildir</button></div><p className="mt-1 text-xs text-slate-500">Müştəri rəyləri</p>
    <div className="mt-4 space-y-3">{reviews.filter((review) => review.status !== "hidden").length ? reviews.filter((review) => review.status !== "hidden").map((review) => <article key={review.id} className="rounded-xl border border-slate-100 p-3"><div className="flex justify-between gap-2 text-sm"><strong>{review.name}</strong><span className="text-slate-500">{review.date}</span></div><div aria-label={`${review.rating} / 5`} className="text-amber-500">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div><p className="mt-1 break-words text-sm">{review.text}</p>{review.reply && <p className="mt-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-600">Məkanın cavabı: {review.reply}</p>}</article>) : <p className="text-sm text-slate-500">Hələ rəy yoxdur.</p>}</div>
    <Dialog open={open || (pendingAuth && !!user)} onOpenChange={(next) => { setOpen(next); if (!next) setPendingAuth(false); }}><DialogContent className="customer-modal max-h-[90dvh] max-w-md overflow-y-auto rounded-3xl p-5" overlayClassName="customer-overlay"><DialogHeader><DialogTitle>Rəy yazın</DialogTitle></DialogHeader><form onSubmit={submit} className="space-y-3"><label className="block text-xs font-semibold">Qiymət<select value={rating} onChange={(event) => setRating(Number(event.target.value))} className="mt-1 block w-full rounded-xl border border-slate-200 p-2 text-sm">{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select></label><label className="block text-xs font-semibold">Rəyiniz<textarea required maxLength={1000} value={text} onChange={(event) => setText(event.target.value)} className="mt-1 block min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm" /></label>{error && <p role="alert" className="text-xs text-red-700">{error}</p>}<button type="submit" className="w-full rounded-xl bg-yellow-primary px-5 py-3 text-sm font-semibold">{user ? "Rəyi əlavə et" : "Daxil ol və rəy yaz"}</button></form></DialogContent></Dialog>
  </section>;
}
