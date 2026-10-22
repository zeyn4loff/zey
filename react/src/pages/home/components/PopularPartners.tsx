import SectionHeader from "@/components/common/SectionHeader";
import {partners} from "@/consts";
import {PartnerCard} from "@/pages/home/components/PartnerCard.tsx";


function PopularPartners() {
    return (
        <section className="container my-8 px-0!">
            <SectionHeader
                title="Populyar şəbəkələr"
                description="Bakının aparıcı brend mərkəzləri"
            />

            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                {partners.map((partner) => (
                    <PartnerCard key={partner.id} partner={partner}/>
                ))}
            </div>
        </section>
    );
}

export default PopularPartners;