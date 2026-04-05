import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/reusables/header";
import { Toaster } from "sonner";

const instrumentSansHeading = Instrument_Sans({
    subsets: ["latin"],
    variable: "--font-heading",
});

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "SpeakConfident AI",
    description:
        "An AI coaching app that listens to your presentation and turns it into actionable feedback on confidence, clarity, and delivery, all visualized in a smart, interactive dashboard.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="en"
            className={cn(
                "h-full",
                "antialiased",
                geistSans.variable,
                geistMono.variable,
                instrumentSansHeading.variable,
                "font-sans",
            )}
        >
            <body className="h-screen flex flex-col">
                {/* <Header /> */}
                <div>{children}</div>
                <Toaster />
            </body>
        </html>
    );
}
