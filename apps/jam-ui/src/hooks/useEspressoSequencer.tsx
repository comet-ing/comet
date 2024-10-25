import { useCallback, useState } from "react";
import { Address, Hex, stringToHex } from "viem";
import { PayloadData } from "../components/jams/types";
import { getWalletClient } from "../utils/chain";

const rollupsHost = process.env.NEXT_PUBLIC_ROLLUPS_ENDPOINT;

const l2DevNonceUrl = `${rollupsHost}/nonce`;
const l2DevSendTransactionUrl = `${rollupsHost}/submit`;

type TypedDataOpts = {
    chainId: string;
    maxGasPrice: number;
};

const typedDataBuilder = ({ chainId, maxGasPrice = 10 }: TypedDataOpts) => ({
    domain: {
        name: "Cartesi",
        version: "0.1.0",
        chainId: BigInt(chainId),
        verifyingContract: "0x0000000000000000000000000000000000000000",
    } as const,
    types: {
        EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
        ],
        CartesiMessage: [
            { name: "app", type: "address" },
            { name: "nonce", type: "uint64" },
            { name: "max_gas_price", type: "uint128" },
            { name: "data", type: "bytes" },
        ],
    } as const,
    primaryType: "CartesiMessage" as const,
    message: {
        app: "0x" as `0x${string}`,
        nonce: BigInt(0),
        data: "0x" as `0x${string}`,
        max_gas_price: BigInt(maxGasPrice),
    },
});

const fetchNonceL2 = async (user: Address, application: Address) => {
    const response = await fetch(l2DevNonceUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            msg_sender: user,
            app_contract: application,
        }),
    });

    const responseData = await response.json();
    return responseData.nonce;
};

const submitTransactionL2 = async (fullBody: any) => {
    const body = JSON.stringify(fullBody);
    const response = await fetch(l2DevSendTransactionUrl, {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
        console.log("submit to L2 failed");
        throw new Error("submit to L2 failed: " + (await response.text()));
    } else {
        const result = response.json();
        console.log(result);
        return result;
    }
};

type SubmitTransactionProps = {
    chainId: string;
    payloadData: PayloadData;
    appAddress: Hex;
    account: Hex;
};

const addTransactionL2 = async ({
    account,
    appAddress,
    chainId,
    payloadData,
}: SubmitTransactionProps) => {
    if (chainId) {
        console.info("adding TransactionL2");
        console.info("chainId", chainId);
        const walletClient = await getWalletClient(chainId);
        if (!walletClient) return;

        console.log(`account: ${account}`);

        const nonce = await fetchNonceL2(account, appAddress);

        const typedData = typedDataBuilder({ chainId, maxGasPrice: 10 });

        typedData.message = {
            app: appAddress,
            nonce,
            data: stringToHex(JSON.stringify(payloadData)),
            max_gas_price: BigInt(10),
        };

        try {
            const signature = await walletClient.signTypedData({
                account,
                ...typedData,
            });
            const l2data = JSON.parse(
                JSON.stringify(
                    {
                        typedData,
                        account,
                        signature,
                    },
                    (_, value) =>
                        typeof value === "bigint" ? Number(value) : value,
                ),
            );
            return await submitTransactionL2(l2data);
        } catch (e: any) {
            console.error(`Error in L2 transaction: ${e}`);
            return Promise.reject(e as Error);
        }
    }
};

type UseEspressoSequencer = {
    appAddress?: Hex;
    account?: Hex;
    chainId: string;
};

type Status = "loading" | "success" | "error" | "idle";

const useEspressoSequencer = ({
    account,
    chainId,
    appAddress,
}: UseEspressoSequencer) => {
    const [status, setStatus] = useState<Status>("idle");
    const [error, setError] = useState<Error | null>(null);
    const [data, setData] = useState<Record<string, any> | undefined>();

    const reset = () => {
        setStatus("idle");
        setError(null);
        setData(undefined);
    };

    const submitTransaction = useCallback(
        (payload: PayloadData) => {
            if (!account || !chainId || !appAddress) {
                console.warn(
                    `Account and chainId required to send transaction to L2. ChainId=${chainId} | Account=${account}`,
                );
                return;
            }

            setStatus("loading");
            addTransactionL2({
                account,
                appAddress,
                chainId,
                payloadData: payload,
            })
                .then((data) => {
                    setStatus("success");
                    setData(data);
                })
                .catch((error) => {
                    setStatus("error");
                    setError(error);
                });
        },
        [account, chainId],
    );

    return {
        status,
        data,
        error,
        reset,
        submitTransaction,
    };
};

export default useEspressoSequencer;
