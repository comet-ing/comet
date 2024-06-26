import { ColorSchemeScript } from "@mantine/core";
import "@mantine/core/styles.css";
import type { Metadata } from "next";
import { Plausible } from "../components/Plausible";
import StyleProvider from "../providers/styleProvider";
import { horizon } from "../styles/fonts";
import "./globals.css";

export const metadata: Metadata = {
    title: "Comet",
    description: "Co-create and mint stories, poems, quips",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <Plausible />
                <ColorSchemeScript />
            </head>

            <body className={horizon.className}>
                <StyleProvider>{children}</StyleProvider>
            </body>
        </html>
    );
}
