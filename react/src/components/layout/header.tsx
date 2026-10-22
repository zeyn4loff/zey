import {
    MapPin,
    ChevronDown,
    Heart,
    CalendarDays,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import LanguageIndicator from "@/components/common/LanguageIndicator";
import { menuItems } from "@/consts";
import { useState } from "react";
import { useLocationCity } from "@/features/location/useLocationCity";
import { useCustomer } from "@/features/customer/useCustomer";
import CityDialog from "../common/CityDialog";
import HeroBanner from "../common/HeroBanner";

export default function Header() {
    const { user, openModal } = useCustomer();
    const isHome = useLocation().pathname === "/";
    const [cityDialogOpen, setCityDialogOpen] = useState(false);
    const { city: selectedCity, setCity: setSelectedCity } = useLocationCity();
    return (
        <header className={`bg-yellow-primary overflow-hidden relative ${isHome ? "h-62.5" : "h-16"}`}>
            <div className="absolute -right-24 -top-36 w-105 h-105 rounded-full border-60 border-black/3 pointer-events-none"></div>
            <div className="relative overflow-hidden container mx-auto py-0!">
                <div className="max-w-305 mx-auto flex items-center justify-between h-full border-b border-black/10">
                    <div className="flex min-w-0 items-center gap-1.5 max-h-16 sm:gap-5">
                        <Link to="/" className="shrink-0">
                            <img
                                src="/zeyvo-black.svg"
                                alt="zeyvo"
                                className="h-14 w-14 sm:h-18 sm:w-18"
                            />
                        </Link>

                        <Button
                            type="button"
                            variant="default"
                            onClick={() => setCityDialogOpen(true)}
                            className="h-9! min-w-0 gap-1 rounded-xl bg-black/[0.07] px-2 text-xs! font-bold leading-none text-primary hover:bg-black/10 sm:px-2.5"
                        >
                            <MapPin size={12} />

                            <span className="text-xs leading-none">
                                {selectedCity}
                            </span>

                            <ChevronDown size={12} />
                        </Button>
                    </div>

                    <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">

                        <nav className="hidden items-center gap-1 font-medium lg:flex">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="flex h-9 items-center justify-center rounded-xl px-3.5 text-center text-xs! font-plus-jakarta font-bold leading-none transition-colors hover:bg-black/10"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <LanguageIndicator />

                        <Button type="button" variant="ghost" size="sm" onClick={() => openModal("favorites")} className="hidden h-9 gap-2 rounded-xl bg-black/[0.07] px-3 text-xs font-semibold hover:bg-black/10 md:flex"><Heart size={15} className="text-rose-500" />Seçilmişlər</Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => openModal("bookings")} className="hidden h-9 gap-2 rounded-xl bg-black/[0.07] px-3 text-xs font-semibold hover:bg-black/10 md:flex"><CalendarDays size={15} />Yazılarım</Button>
                        <Button type="button" size="sm" onClick={() => openModal(user ? "profile" : "auth")} className="h-9 max-w-24 truncate rounded-xl bg-[#191919] px-2.5 text-xs font-semibold text-white hover:bg-[#333] sm:max-w-none sm:px-4">{user ? user.name : "Daxil ol"}</Button>

                    </div>
                </div>

                    <CityDialog
                        open={cityDialogOpen}
                        onOpenChange={setCityDialogOpen}
                        selectedCity={selectedCity}
                        onSelectCity={setSelectedCity}
                    />


                {isHome && <HeroBanner />}

            </div>
        </header>
    );
}
