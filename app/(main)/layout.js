import { Inter } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import SessionProvider from "@/components/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "FarmFresh",
  description: "Local Farmer Booking Platform",
};

export default function RootLayout({ children, modal }) {
  return (
    <html lang="en">
      <body className={`min-h-screen ${inter.className}`}>
        <SessionProvider>
          <Navbar sideMenu={true} />
          {children}
          {modal}
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}