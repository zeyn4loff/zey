
import { Outlet } from "react-router";
import BottomNavbar from "@/components/layout/BottomNavbar";
import Header from "./header";
import Footer from "./footer";

export default function MainLayout() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />

            <main className="flex-1 bg-second">
                <Outlet />
            </main>

            <Footer />

            <BottomNavbar />
        </div>
    );
}
