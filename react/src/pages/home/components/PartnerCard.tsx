import type {Partner} from "@/types";
import {Link} from "react-router";

export function PartnerCard({ partner }: { partner: Partner }) {
    return (
        <Link
            to={`/catalog?q=${encodeURIComponent(partner.name.split(" ")[0])}`}
            className="flex flex-col items-center gap-2.5 rounded-3xl border border-slate-100 bg-white px-3 py-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
        >
            <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                <img
                    src={partner.logo}
                    alt={`${partner.name} loqosu`}
                    className="size-full object-contain"
                    loading="lazy"
                />
            </div>

            <div>
                <h3 className="mb-0.5 text-center text-[13px] font-semibold text-slate-900">
                    {partner.name}
                </h3>

                <p className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                    <span>{partner.meta}</span>
                </p>
            </div>
        </Link>
    );
}
