"use client";
import { FC } from "react";

const dataDomain = process.env.NEXT_PUBLIC_WWW_DOMAIN;
const src = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export const Plausible: FC = () => {
    if (!dataDomain || !src) return "";

    return <script defer data-domain={dataDomain} src={src}></script>;
};
