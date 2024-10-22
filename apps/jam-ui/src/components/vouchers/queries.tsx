"use client";
import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { Address, zeroAddress } from "viem";
import {
    GetVouchersDocument,
    GetVouchersQueryVariables,
} from "../../generated/graphql/rollups/operations";
import { decodeVoucher, isVoucherOwnedByAccount } from "./functions";
import { Voucher, VoucherType } from "./types";

const rollupsHost = process.env.NEXT_PUBLIC_ROLLUPS_ENDPOINT;
const dappAddress = process.env.NEXT_PUBLIC_APP_ADDRESS;
const graphqlURL = `${rollupsHost}/graphql/${dappAddress}`;

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

export type UserVoucher = {
    type: VoucherType;
    voucher: Voucher;
    value: string;
    receiver: Address;
};

/**
 *
 * @param address
 * @returns
 */
const fetchVouchers = async (address?: Address) => {
    if (!address) return null;

    const { vouchers } = await request<VoucherQuery, GetVouchersQueryVariables>(
        graphqlURL,
        GetVouchersDocument,
    );

    const edges = vouchers.edges ?? [];

    const data: UserVoucher[] = edges
        .filter((node) => isVoucherOwnedByAccount(node.voucher, address))
        .map(({ voucher }) => {
            const { value, receiver, type } = decodeVoucher(voucher);
            return { voucher, value: value.toString(), receiver, type };
        });

    return data;
};

// HOOKS

export const useGetUserVouchers = (address?: Address) => {
    return useQuery({
        queryKey: voucherKeys.list(address ?? zeroAddress),
        queryFn: () => fetchVouchers(address),
    });
};
