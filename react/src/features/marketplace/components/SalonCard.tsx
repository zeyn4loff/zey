
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router";
import type { Salon } from "@/features/marketplace/data";
import { Star, Heart } from "lucide-react";

export default function BeautyServiceCard({
    item, isFavorite, onToggleFavorite, onBook,
}: { item: Salon; isFavorite: boolean; onToggleFavorite: () => void; onBook: () => void }) {
    return (
        <Card className="group mx-auto w-full max-w-sm gap-0 overflow-hidden rounded-3xl border-border/60 bg-card py-0 ring-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="relative aspect-16/8 overflow-hidden">
                <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-linear-to-t from-black/65 via-transparent to-black/20" />

                <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    aria-label={isFavorite ? "Sevimlilərdən çıxar" : "Sevimlilərə əlavə et"}
                    aria-pressed={isFavorite}
                    onClick={onToggleFavorite}
                    className="absolute right-3 top-3 size-9 rounded-full border border-white/30 bg-white text-gray-400 hover:bg-white hover:text-rose-500"
                >
                    <Heart className={`size-4 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
                </Button>

                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-white/90">
                        {item.location}
                    </span>

                    <Badge className="shrink-0 gap-1 rounded-sm border-0 bg-white text-[11px] font-bold text-primary">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        {item.rating}
                    </Badge>
                </div>
            </div>

            <CardHeader className="gap-2 px-4 pt-4">
                <CardTitle className="pr-2 text-lg font-bold leading-tight text-primary">
                    <Link to={`/salon/${item.id}`} className="hover:underline">{item.name}</Link>
                </CardTitle>

                <CardDescription className="mt-0.5 flex items-start gap-1.5 text-xs font-medium text-slate-400">
                    {item.tag} · {item.reviewsCount} rəy
                </CardDescription>
            </CardHeader>

            <div className="mx-4 mt-4 space-y-3 border-y py-4">
                {item.services.map((service) => (
                    <div
                        key={service.name}
                        className="flex items-start justify-between gap-2"
                    >
                        <p className="max-w-50 truncate text-xs font-medium leading-5 text-slate-600">
                            {service.name}
                        </p>

                        <span className="shrink-0 text-sm font-semibold">
                            {service.price} ₼
                        </span>
                    </div>
                ))}
            </div>

            <div className="mx-2 mt-4 rounded-lg p-3">
                <div className="mb-2 text-[11px] font-bold text-slate-500">
                    Bu gün boş vaxtlar
                </div>

                <div className="flex flex-wrap gap-2">
                    {item.slots.map((time) => (
                        <Badge
                            key={time}
                            variant="secondary"
                            className="rounded-sm bg-second! px-2.5 py-1 font-bold text-black"
                        >
                            {time}
                        </Badge>
                    ))}
                </div>
            </div>

            <CardFooter className="flex gap-2 p-4 pt-4 bg-white">
                <Button type="button" onClick={onBook} className="flex-1 gap-2 rounded-xl py-5" size="lg">Yazıl</Button>
                <Link to={`/salon/${item.id}`} className="inline-flex h-9 items-center rounded-xl border border-slate-200 px-3 text-xs font-semibold">Ətraflı</Link>
            </CardFooter>
        </Card>
    );
}
