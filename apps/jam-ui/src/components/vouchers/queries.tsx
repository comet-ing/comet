"use client";
import { useOutputs } from "@cartesi/wagmi";
import { useMemo } from "react";
import { Address, zeroAddress } from "viem";
import { useApplicationAddress } from "../../hooks/useApplicationAddress";
import { outputToVoucher } from "../../utils/rollups.rpc";
import { decodeVoucher, isVoucherOwnedByAccount } from "./functions";
import { Voucher, VoucherType } from "./types";

export const voucherKeys = {
    base: ["vouchers"] as const,
    lists: () => [...voucherKeys.base, "list"] as const,
    list: (account: Address) => [...voucherKeys.lists(), account] as const,
};

export type UserVoucher = {
    type: VoucherType;
    voucher: Voucher;
    value: string;
    receiver: Address;
};

const OUTPUTS_LIMIT = 200;

/**
 * Fetch user vouchers via @cartesi/wagmi useOutputs (JSON-RPC cartesi_listOutputs),
 * then filter by owner and map to UserVoucher[].
 */
export const useGetUserVouchers = (address?: Address) => {
    const application = useApplicationAddress();
    const { data, isLoading, error, refetch } = useOutputs({
        application,
        limit: OUTPUTS_LIMIT,
        offset: 0,
    });

    const userVouchers = useMemo(() => {
        if (!address || !data?.data) return null;
        const outputs = data.data;
        const vouchers: Voucher[] = [];
        for (const output of outputs) {
            if (output.decodedData.type === "Voucher") {
                vouchers.push(
                    outputToVoucher({
                        index: output.index,
                        inputIndex: output.inputIndex,
                        epochIndex: output.epochIndex,
                        rawData: output.rawData,
                        outputHashesSiblings: output.outputHashesSiblings,
                        decodedData: output.decodedData,
                        executionTransactionHash: output.executionTransactionHash,
                    }),
                );
            }
        }
        return vouchers
            .filter((v) => isVoucherOwnedByAccount(v, address))
            .map((voucher) => {
                const { value, receiver, type } = decodeVoucher(voucher);
                return { voucher, value: value.toString(), receiver, type };
            });
    }, [address, data?.data]);

    return {
        data: userVouchers ?? undefined,
        isLoading,
        error,
        refetch,
    };
};
