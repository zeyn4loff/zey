import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import MainLayout from "@/components/layout/MainLayout";
import { CustomerProvider } from "@/features/customer/CustomerContext";
import CustomerModals from "@/features/customer/CustomerModals";
import { LocationProvider } from "@/features/location/LocationContext";

const Home = lazy(() => import("@/pages/home"));
const CatalogPage = lazy(() => import("@/pages/catalog"));
const MastersPage = lazy(() => import("@/pages/masters"));
const SalonPage = lazy(() => import("@/pages/salon"));
const MasterPage = lazy(() => import("@/pages/master"));
const CitiesPage = lazy(() => import("@/pages/cities"));
const LegalPage = lazy(() => import("@/pages/legal"));
const StatusPage = lazy(() => import("@/pages/status"));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <LocationProvider>
        <CustomerProvider>
          <Suspense fallback={<div role="status" className="flex min-h-[40vh] items-center justify-center bg-second px-4 text-sm font-semibold text-slate-500">Səhifə yüklənir…</div>}>
            <Routes>
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
                <Route path="*" element={<StatusPage />} />
              </Route>
            </Routes>
          </Suspense>
          <CustomerModals />
        </CustomerProvider>
      </LocationProvider>
    </BrowserRouter>
  );
}
