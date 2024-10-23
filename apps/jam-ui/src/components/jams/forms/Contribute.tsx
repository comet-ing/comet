"use client";
import { Button, Collapse, Group, Stack, Text, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedValue } from "@mantine/hooks";
import { FC, useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { Hex, stringToHex } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";
import {
    useSimulateInputBoxAddInput,
    useWriteInputBoxAddInput,
} from "../../../generated/wagmi-rollups";
import { useApplicationAddress } from "../../../hooks/useApplicationAddress";
import { useChainId } from "../../../hooks/useChainId";
import { getWalletClient } from "../../../utils/chain";
import { TransactionProgress } from "../../TransactionProgress";
import { transactionState } from "../../TransactionState";

export interface Props {
    onSuccess?: () => void;
    jamId: number;
}

export const ContributeJamForm: FC<Props> = ({ onSuccess, jamId }) => {
    const form = useForm({
        validateInputOnChange: true,
        initialValues: {
            jamID: jamId,
            entry: "",
        },
        validate: {
            entry: (value) =>
                value === ""
                    ? "Entry is required to contribute to this Comet"
                    : null,
        },
        transformValues: (values) => {
            let hexInput: Hex = "0x0";

            if (values.entry !== "") {
                hexInput = stringToHex(
                    JSON.stringify({
                        action: "jam.append",
                        ...values,
                    }),
                );
            }
            return { hexInput };
        },
    });

    const address = useApplicationAddress();

    const { hexInput } = form.getTransformedValues();

    const prepare = useSimulateInputBoxAddInput({
        args: [address, hexInput],
        query: {
            enabled: address !== null && hexInput !== "0x0",
        },
    });

    const execute = useWriteInputBoxAddInput();
    const wait = useWaitForTransactionReceipt({
        hash: execute.data,
    });

    const { disabled: appendDisabled, loading: appendLoading } =
        transactionState(prepare, execute, wait, true);

    const loading = execute.isPending || wait.isLoading || appendLoading;
    const canSubmit =
        form.isValid() && prepare.error === null && !appendDisabled;

    const [debouncedLoading] = useDebouncedValue(loading, 500);
    const [debouncedCanSubmit] = useDebouncedValue(canSubmit, 500);

    const [cartesiTxId, setCartesiTxId] = useState<string>("");

    const chainId = useChainId();
    const l2DevNonceUrl = "http://localhost:8080/nonce";
    const l2DevSendTransactionUrl = "http://localhost:8080/submit";

    const typedData = {
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
            max_gas_price: BigInt(10),
        },
    };

    const fetchNonceL2 = async (user: any, application: any) => {
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
            return response.json();
        }
    };

    const addTransactionL2 = async () => {
        console.log("adding TransactionL2");
        console.log("chainId", chainId);
        if (chainId) {
            const walletClient = await getWalletClient(chainId);
            if (!walletClient) return;
            const [account] = await walletClient.requestAddresses();
            if (!account) return;

            // Create the payload with "action": "jam.create"
            const payloadData = {
                action: "jam.append",
                ...form.values,
            };

            const payload = stringToHex(JSON.stringify(payloadData));
            const app = address;
            const nonce = await fetchNonceL2(account, app);

            // typedData.domain.chainId = BigInt(chainId); set above
            typedData.message = {
                app,
                nonce,
                data: payload,
                max_gas_price: BigInt(10),
            };

            try {
                setCartesiTxId("");
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
                const res = await submitTransactionL2(l2data);
                setCartesiTxId(res.id);
                if (onSuccess) onSuccess();
            } catch (e) {
                console.error(`Error in L2 transaction: ${e}`);
            }
        }
    };

    useEffect(() => {
        if (wait.isSuccess) {
            form.reset();
            execute.reset();

            if (onSuccess !== undefined && onSuccess instanceof Function) {
                onSuccess();
            }
        }
    }, [wait.isSuccess, onSuccess, form, execute]);

    return (
        <form id="contribute-form">
            <Stack>
                <Textarea
                    autosize
                    minRows={2}
                    maxRows={5}
                    resize="vertical"
                    label="Entry"
                    description="Contribute to the Comet content."
                    withAsterisk
                    {...form.getInputProps("entry")}
                />

                <Collapse
                    in={
                        execute.isPending ||
                        wait.isLoading ||
                        execute.isSuccess ||
                        execute.isError
                    }
                >
                    <TransactionProgress
                        prepare={prepare}
                        execute={execute}
                        wait={wait}
                        confirmationMessage="Entry sent successfully!"
                        defaultErrorMessage={execute.error?.message}
                    />
                </Collapse>

                <Group justify="right">
                    <Button
                        variant="filled"
                        disabled={!debouncedCanSubmit}
                        leftSection={<FaCheck />}
                        loading={debouncedLoading}
                        onClick={() =>
                            execute.writeContract(prepare.data!.request)
                        }
                    >
                        ADD (L1)
                    </Button>
                    <Button
                        variant="outline"
                        disabled={!form.isValid()}
                        leftSection={<FaCheck />}
                        loading={debouncedLoading}
                        onClick={addTransactionL2}
                    >
                        ADD (L2)
                    </Button>
                </Group>

                {cartesiTxId && (
                    <Text size="sm" c="dimmed">
                        L2 Transaction ID: {cartesiTxId}
                    </Text>
                )}
            </Stack>
        </form>
    );
};
