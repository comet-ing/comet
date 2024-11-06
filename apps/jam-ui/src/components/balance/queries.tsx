"use client";
import { useQuery } from "@tanstack/react-query";
import { Address, hexToString, zeroAddress } from "viem";
import { inspectUrl, parseReportPayload } from "../../utils/rollups.inspect";
import { InspectResponseBody } from "../../utils/rollups.types";

const rollupHost = process.env.NEXT_PUBLIC_ROLLUPS_ENDPOINT;
const dappAddress = process.env.NEXT_PUBLIC_APP_ADDRESS;

export const balanceKeys = {
    base: ["balance"] as const,
    details: () => [...balanceKeys.base, "detail"] as const,
    detail: (id: Address) => [...balanceKeys.details(), id] as const,
};

const createError = (message: string) => Promise.reject(new Error(message));

const fetchBalance = async (account?: Address) => {
    if (account === undefined || account === null) return 0n;

    const url = `${inspectUrl}/${encodeURIComponent(`balance/${account}`)}`;

    const response = await fetch(url);

    if (!response.ok) {
        return createError(`Network response error - ${response.status}`);
    }

    const data = (await response.json()) as InspectResponseBody;

    if (data.status === "Exception")
        return createError(hexToString(data.exception_payload));

    const result = parseReportPayload(data.reports[0], "0", BigInt);
    return result;
};

// HOOKS

export const useGetBalance = (account?: Address) => {
    return useQuery({
        queryKey: balanceKeys.detail(account ?? zeroAddress),
        queryFn: () => fetchBalance(account),
        refetchInterval: 180 * 1000,
        refetchIntervalInBackground: true,
    });
};
