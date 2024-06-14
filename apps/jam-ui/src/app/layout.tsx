import { ColorSchemeScript } from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import { Providers } from "../providers/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "JAM TWT",
    description: "Co-create and mint stories, poems, quips",
};

const Shell = dynamic(() => import("../components/layout/shell"), {
    ssr: false,
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <ColorSchemeScript />
            </head>
            <body className={inter.className}>
                <Providers>
                    <>
                        <Notifications position="top-right" zIndex={1000} />
                        <Shell>{children}</Shell>
                    </>
                </Providers>
            </body>
        </html>
    );
}
