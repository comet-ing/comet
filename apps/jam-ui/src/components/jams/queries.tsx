"use client";
import { useQuery } from "@tanstack/react-query";
import { hexToString } from "viem";
import { InspectResponseBody, Report } from "../../utils/rollups.types";
import { Jam, JamListFilter } from "./types";

const rollupHost = process.env.NEXT_PUBLIC_ROLLUPS_ENDPOINT;

const jamKeys = {
    base: ["jams"] as const,
    lists: () => [...jamKeys.base, "list"] as const,
    list: (filter: JamListFilter) => [...jamKeys.lists(), filter] as const,
    details: () => [...jamKeys.base, "detail"] as const,
    detail: (id: number) => [...jamKeys.details(), id] as const,
};

const parseReport = <T,>(report: Report, defaultValue: any): T => {
    if (report) {
        try {
            return JSON.parse(hexToString(report.payload)) as T;
        } catch (error: any) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    return defaultValue;
};

const createError = (message: string) => Promise.reject(new Error(message));

const action = {
    all: "alljams",
    closed: "closedjams",
    open: "openjams",
} as const;

const fetchJams = async (filter: JamListFilter = "all") => {
    const url = `${rollupHost}/inspect/${action[filter]}`;

    const response = await fetch(url);

    if (!response.ok) {
        return createError(`Network response error - ${response.status}`);
    }

    const data = (await response.json()) as InspectResponseBody;

    if (data.status === "Exception")
        return createError(hexToString(data.exception_payload));

    const result = parseReport<Jam[]>(data.reports[0], []);

    return result;
};

export const useListJams = (filter: JamListFilter = "all") => {
    return useQuery({
        queryKey: jamKeys.list(filter),
        queryFn: () => fetchJams(filter),
    });
};
