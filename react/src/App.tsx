import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import MainLayout from "@/components/layout/MainLayout";
import { CustomerProvider } from "@/features/customer/CustomerContext";
import CustomerModals from "@/features/customer/CustomerModals";
import { LocationProvider } from "@/features/location/LocationContext";
import BusinessSessionProvider from "@/features/business/auth/BusinessSessionProvider";

const Home = lazy(() => import("@/pages/home"));
const CatalogPage = lazy(() => import("@/pages/catalog"));
const MastersPage = lazy(() => import("@/pages/masters"));
const SalonPage = lazy(() => import("@/pages/salon"));
const MasterPage = lazy(() => import("@/pages/master"));
const CitiesPage = lazy(() => import("@/pages/cities"));
const LegalPage = lazy(() => import("@/pages/legal"));
const StatusPage = lazy(() => import("@/pages/status"));
const BusinessLandingPage = lazy(() => import("@/pages/business"));
const BusinessAuthPage = lazy(() => import("@/pages/business-auth"));
const BusinessDashboardPage = lazy(() => import("@/pages/business-dashboard"));
const BusinessCalendarPage = lazy(() => import("@/pages/business-calendar"));
const BusinessResourcesPage = lazy(() => import("@/pages/business-resources"));
const BusinessProductsPage = lazy(() => import("@/pages/business-products"));
const BusinessStaffPage = lazy(() => import("@/pages/business-staff"));
const BusinessServicesPage = lazy(() => import("@/pages/business-services"));
const BusinessClientsPage = lazy(() => import("@/pages/business-clients"));
const BusinessLoyaltyPage = lazy(() => import("@/pages/business-loyalty"));
const BusinessMarketingPage = lazy(() => import("@/pages/business-marketing"));
const BusinessIntegrationsPage = lazy(() => import("@/pages/business-integrations"));
const BusinessFinancePage = lazy(() => import("@/pages/business-finance"));
const BusinessProfilePage = lazy(() => import("@/pages/business-profile"));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <LocationProvider>
        <BusinessSessionProvider>
        <CustomerProvider>
          <Suspense fallback={<div role="status" className="flex min-h-[40vh] items-center justify-center bg-second px-4 text-sm font-semibold text-slate-500">Səhifə yüklənir…</div>}>
            <Routes>
              <Route path="business/auth" element={<BusinessAuthPage />} />
              <Route path="business" element={<BusinessDashboardPage />} />
              <Route path="business/biznes" element={<BusinessDashboardPage />} />
              <Route path="business/calendar" element={<BusinessCalendarPage />} />
              <Route path="business/resources" element={<BusinessResourcesPage />} />
              <Route path="business/products" element={<BusinessProductsPage />} />
              <Route path="business/staff" element={<BusinessStaffPage />} />
              <Route path="business/services" element={<BusinessServicesPage />} />
              <Route path="business/clients" element={<BusinessClientsPage />} />
              <Route path="business/loyalty" element={<BusinessLoyaltyPage />} />
              <Route path="business/marketing" element={<BusinessMarketingPage />} />
              <Route path="business/integrations" element={<BusinessIntegrationsPage />} />
              <Route path="business/finance" element={<BusinessFinancePage />} />
              <Route path="business/profile" element={<BusinessProfilePage />} />
              <Route path="business/profile/:tab" element={<BusinessProfilePage />} />
              <Route element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="catalog" element={<CatalogPage />} />
                <Route path="catalog/:category" element={<CatalogPage />} />
                <Route path="catalog/:category/:subcategory" element={<CatalogPage />} />
                <Route path="salons" element={<CatalogPage />} />
                <Route path="salons/:category" element={<CatalogPage />} />
                <Route path="salons/:category/:subcategory" element={<CatalogPage />} />
                <Route path="masters" element={<MastersPage />} />
                <Route path="salon/:id" element={<SalonPage />} />
                <Route path="master/:id" element={<MasterPage />} />
                <Route path="masters/:id" element={<MasterPage />} />
                <Route path="cities" element={<CitiesPage />} />
                <Route path="terms" element={<LegalPage />} />
                <Route path="privacy" element={<LegalPage />} />
                <Route path="for-business" element={<BusinessLandingPage />} />
                <Route path="*" element={<StatusPage />} />
              </Route>
            </Routes>
          </Suspense>
          <CustomerModals />
        </CustomerProvider>
        </BusinessSessionProvider>
      </LocationProvider>
    </BrowserRouter>
  );
}
