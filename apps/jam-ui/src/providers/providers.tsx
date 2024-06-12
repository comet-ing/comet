"use client";
import React from "react";
import StyleProvider from "./styleProvider";
import WalletProvider from "./walletProvider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <StyleProvider>
            <WalletProvider>{children}</WalletProvider>
        </StyleProvider>
    );
}
