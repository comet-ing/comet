"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchJamById, fetchJams, fetchJamsStats } from "./fetchers";
import { JamListFilter } from "./types";

export const jamKeys = {
    base: ["jams"] as const,
    lists: () => [...jamKeys.base, "list"] as const,
    list: (filter: JamListFilter) => [...jamKeys.lists(), filter] as const,
    details: () => [...jamKeys.base, "detail"] as const,
    detail: (id: number) => [...jamKeys.details(), id] as const,
    stats: () => [...jamKeys.base, "stats"] as const,
};

export const useListJams = (filter: JamListFilter = "all") => {
    return useQuery({
        queryKey: jamKeys.list(filter),
        queryFn: () => fetchJams(filter),
    });
};

export const useFindJam = (id: number) => {
    return useQuery({
        queryKey: jamKeys.detail(id),
        queryFn: () => fetchJamById(id),
    });
};

export const useListJamsStats = () => {
    return useQuery({
        queryKey: jamKeys.stats(),
        queryFn: () => fetchJamsStats(),
    });
};
