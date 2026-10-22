import { useState } from "react";
import { Search } from "lucide-react";
import { cities } from "@/features/location/cities";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface CityDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedCity: string;
    onSelectCity: (city: string) => void;
}

export default function CityDialog({ open, onOpenChange, selectedCity, onSelectCity }: CityDialogProps) {
    const [query, setQuery] = useState("");
    const filteredCities = cities.filter((city) => city.name.toLocaleLowerCase("az").includes(query.trim().toLocaleLowerCase("az")));

    function closeDialog() {
        onOpenChange(false);
        setQuery("");
    }

    function selectCity(city: string) {
        onSelectCity(city);
        closeDialog();
    }

    return <Dialog open={open} onOpenChange={(next) => next ? onOpenChange(true) : closeDialog()}>
        <DialogContent overlayClassName="city-dialog-overlay" className="city-dialog-content w-[calc(100vw-2rem)] sm:max-w-[26rem] rounded-[26px] border-0 bg-white p-6 text-black shadow-2xl motion-reduce:animate-none">
            <DialogHeader>
                <DialogTitle className="text-left text-base font-bold">Şəhər seçin</DialogTitle>
            </DialogHeader>
            <label className="relative block">
                <span className="sr-only">Şəhər axtar</span>
                <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Şəhər axtar..." autoComplete="off" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-yellow-primary focus:ring-2 focus:ring-yellow-primary/30" />
            </label>
            <div className="flex max-h-[min(50vh,360px)] flex-col gap-2 overflow-y-auto pr-1">
                {filteredCities.map((city) => <button key={city.name} type="button" onClick={() => selectCity(city.name)} className={`flex min-h-10 shrink-0 items-center justify-between gap-3 rounded-xl border px-3 text-left text-xs transition-colors ${selectedCity === city.name ? "border-yellow-primary bg-yellow-primary/10" : "border-slate-200 hover:bg-slate-50"}`}>
                    <span className="font-semibold">{city.name}</span>
                    <span className="text-slate-400">{city.count}</span>
                </button>)}
                {filteredCities.length === 0 && <p className="py-6 text-center text-sm text-slate-500">Şəhər tapılmadı</p>}
            </div>
        </DialogContent>
    </Dialog>;
}
