import BusinessBenefits from "@/features/business/components/BusinessBenefits";
import BusinessHero from "@/features/business/components/BusinessHero";
import BusinessInquiryForm from "@/features/business/components/BusinessInquiryForm";

export default function BusinessLandingPage() {
  return <div className="container mx-auto space-y-6 px-4 py-6 pb-24 sm:space-y-8 sm:py-10">
    <BusinessHero />
    <BusinessBenefits />
    <BusinessInquiryForm />
  </div>;
}
