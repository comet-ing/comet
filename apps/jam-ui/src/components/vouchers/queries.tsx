"use client";
import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { Address, zeroAddress } from "viem";
import {
    GetVouchersDocument,
    GetVouchersQueryVariables,
} from "../../generated/graphql/rollups/operations";
import { Voucher } from "./types";

const rollupsHost = process.env.NEXT_PUBLIC_ROLLUPS_ENDPOINT;
const graphqlURL = `${rollupsHost}/graphql`;

export const voucherKeys = {
    base: ["vouchers"] as const,
    lists: () => [...voucherKeys.base, "list"] as const,
    list: (account: Address) => [...voucherKeys.lists(), account] as const,
};

const createError = (message: string) => Promise.reject(new Error(message));

type Node = {
    voucher: Voucher;
};

type VoucherQuery = {
    vouchers: {
        edges: Node[];
    };
};

const fetchVouchers = async (address?: Address) => {
    if (!address) return null;

    const { vouchers } = await request<VoucherQuery, GetVouchersQueryVariables>(
        graphqlURL,
        GetVouchersDocument,
    );
};

// HOOKS

export const useListVouchers = (address?: Address) => {
    return useQuery({
        queryKey: voucherKeys.list(address ?? zeroAddress),
        queryFn: () =>
            request<VoucherQuery, GetVouchersQueryVariables>(
                graphqlURL,
                GetVouchersDocument,
            ),
    });
};
