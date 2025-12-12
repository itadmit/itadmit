import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({ 
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"]
});

export const metadata: Metadata = {
  title: "תדמית אינטראקטיב | בנייה עיצוב ופיתוח אתרי אינטרנט וחנויות וירטואליות",
  description: "תדמית אינטראקטיב הינה חברה המתמחה בבניה, עיצוב ופיתוח אתרי אינטרנט וחנויות וירטואליות. בואו לצפות בעבודות שלנו, להתרשם וליצור עמנו קשר בקלות.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="m-0 p-0">
      <body className={`${heebo.className} m-0 p-0 overflow-x-hidden`}>{children}</body>
    </html>
  );
}
