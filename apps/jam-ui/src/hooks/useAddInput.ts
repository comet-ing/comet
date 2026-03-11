"use client";

import { addInput, walletActionsL1 } from "@cartesi/viem";
import { useCallback, useMemo, useState } from "react";
import { Hex, stringToHex } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import type { PayloadData } from "../components/jams/types";
import { useApplicationAddress } from "./useApplicationAddress";

type Status = "idle" | "loading" | "success" | "error";

export function useAddInput() {
    const { address: account, chain } = useAccount();
    const { data: walletClient } = useWalletClient();
    const application = useApplicationAddress();

    const [status, setStatus] = useState<Status>("idle");
    const [error, setError] = useState<Error | null>(null);
    const [data, setData] = useState<{ hash: Hex } | undefined>();

    const clientWithL1 = useMemo(() => {
        if (!walletClient || !chain || !account) return null;
        return walletClient.extend(walletActionsL1());
    }, [walletClient, chain, account]);

    const reset = useCallback(() => {
        setStatus("idle");
        setError(null);
        setData(undefined);
    }, []);

    const submitTransaction = useCallback(
        (payloadData: PayloadData) => {
            if (!clientWithL1 || !application || !account || !chain) {
                console.warn(
                    "addInput: missing client, application, account, or chain",
                );
                return;
            }

            setStatus("loading");
            setError(null);

            const payload = stringToHex(JSON.stringify(payloadData)) as Hex;

            addInput(clientWithL1, {
                account,
                application,
                chain,
                payload,
            })
                .then((hash) => {
                    setStatus("success");
                    setData({ hash });
                })
                .catch((err) => {
                    setStatus("error");
                    setError(err instanceof Error ? err : new Error(String(err)));
                });
        },
        [clientWithL1, application, account, chain],
    );

    return {
        status,
        error,
        data,
        reset,
        submitTransaction,
    };
}
