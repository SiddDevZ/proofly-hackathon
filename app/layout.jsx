import { Poppins, Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import 'remixicon/fonts/remixicon.css'
import SmoothScrolling from "../components/SmoothScrolling";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-pop",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

export const metadata = {
  title: "Proofly - Your Digital Identity",
  description: "Identity for your digital footprint",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${inter.variable} ${dmSans.variable} font-sans antialiased`}
      >
        <SmoothScrolling />
        {children}
      </body>
    </html>
  );
}
