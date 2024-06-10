"use client";
import React from "react";
import StyleProvider from "./styleProvider";

export function Providers({ children }: { children: React.ReactNode }) {
    return <StyleProvider>{children}</StyleProvider>;
}
