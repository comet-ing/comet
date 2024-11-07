"use client";
import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/en-gb";
import "dayjs/locale/pt-br";
import localizedFormatPlugin from "dayjs/plugin/localizedFormat";
import relativeTimePlugin from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTimePlugin);
dayjs.extend(localizedFormatPlugin);

export const charactersLeft = (text: string, limit: number) => {
    const currentTextSize = text?.length ?? 0;
    const consumedPercentage =
        currentTextSize === 0 ? 0 : Math.round((currentTextSize * 100) / limit);
    const left = limit - currentTextSize;

    return { left, consumedPercentage };
};

const getLocale = () => {
    const lang = navigator.language.toLowerCase();

    switch (lang) {
        case "pt-br":
            return "pt-br";
        case "en-gb":
            return "en-gb";
        default:
            return "en";
    }
};

export const getRelativeTime = (timestamp: number) => {
    return dayjs().locale(getLocale()).to(dayjs(timestamp));
};

console.log();

export const localizedDate = (timestamp: number) => {
    return dayjs(timestamp).locale(getLocale()).format("L LT");
};
