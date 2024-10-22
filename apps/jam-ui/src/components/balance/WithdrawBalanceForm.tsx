"use client";
import {
    Button,
    Collapse,
    Group,
    NumberInput,
    Stack,
    Text,
    UnstyledButton,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedValue } from "@mantine/hooks";
import { FC, useEffect, useState } from "react";
import { FaEthereum } from "react-icons/fa";
import { Hex, formatUnits, parseUnits, stringToHex } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import {
    useSimulateInputBoxAddInput,
    useWriteInputBoxAddInput,
} from "../../generated/wagmi-rollups";
import { useApplicationAddress } from "../../hooks/useApplicationAddress";
import { TransactionProgress } from "../TransactionProgress";
import { transactionState } from "../TransactionState";
import { getWalletClient } from "../../utils/chain";

export interface Props {
    onSuccess?: () => void;
    balance: bigint;
}

export const WithdrawBalanceForm: FC<Props> = ({ onSuccess, balance }) => {
    const { chain } = useAccount();
    const decimals = chain?.nativeCurrency.decimals ?? 18;

    const form = useForm({
        validateInputOnChange: true,
        initialValues: {
            amount: "",
            balance,
            decimals,
        },
        validate: {
            amount: (value, values) => {
                if (value === "" || !value) {
                    return "Amount is required!";
                }

                const amount = parseUnits(value.toString(), values.decimals);

                if (amount > values.balance) {
                    return `This amount is bigger than your balance`;
                }

                return null;
            },
        },
        transformValues: (values) => {
            let hexInput: Hex = "0x0";

            if (values.amount !== "") {
                hexInput = stringToHex(
                    JSON.stringify({
                        action: "eth.withdraw",
                        amount: parseUnits(
                            values.amount.toString(),
                            values.decimals,
                        ).toString(),
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

    const l2DevNonceUrl = "http://localhost:8080/nonce";
    const l2DevSendTransactionUrl = "http://localhost:8080/submit";

    const typedData = {
        domain: {
            name: "Cartesi",
            version: "0.1.0",
            chainId: BigInt(0),
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
            max_gas_price: BigInt(10)
        },
    };

    const fetchNonceL2 = async (user: any, application: any) => {
        const response = await fetch(l2DevNonceUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ msg_sender: user, app_contract: application })
        });

        const responseData = await response.json();
        return responseData.nonce;
    };

    const submitTransactionL2 = async (fullBody: any) => {
        const body = JSON.stringify(fullBody);
        const response = await fetch(l2DevSendTransactionUrl, {
            method: 'POST',
            body,
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            console.log("submit to L2 failed");
            throw new Error("submit to L2 failed: " + await response.text());
        } else {
            return response.json();
        }
    };

    const withdrawEtherL2 = async () => {
        console.log("Withdrawing Ether L2");
        const chainId = "0x7a69"; // TODO: get dynamically
        console.log("chainId", chainId);
        if (chainId) {
            const walletClient = await getWalletClient(chainId);
            if (!walletClient) return;
            const [account] = await walletClient.requestAddresses();
            if (!account) return;

            const payloadData = {
                action: "eth.withdraw",
                amount: form.values.amount,
            };

            const payload = stringToHex(JSON.stringify(payloadData));
            const app = address;
            const nonce = await fetchNonceL2(account, app);
            
            typedData.domain.chainId = BigInt(chainId);
            typedData.message = {
                app,
                nonce,
                data: payload,
                max_gas_price: BigInt(10),
            };

            try {
                setCartesiTxId("");
                const signature = await walletClient.signTypedData({ account, ...typedData });
                const l2data = JSON.parse(JSON.stringify({
                    typedData,
                    account,
                    signature,
                }, (_, value) =>
                    typeof value === 'bigint'
                        ? Number(value)
                        : value
                ));
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
        <form id="withdraw-balance-form">
            <Stack>
                <Stack>
                    <NumberInput
                        hideControls
                        allowNegative={false}
                        label="Amount"
                        description="Amount to withdraw"
                        placeholder="0"
                        rightSectionWidth={60}
                        rightSection={<Text>ETH</Text>}
                        withAsterisk
                        {...form.getInputProps("amount")}
                    />
                    <Stack justify="space-between" mt="-sm">
                        <Group gap={0}>
                            <Text fz="xs">Balance:</Text>
                            <Text id="token-balance" fz="xs" mx={4}>
                                {" "}
                                {balance !== undefined
                                    ? formatUnits(balance, decimals)
                                    : ""}
                            </Text>
                            {balance !== undefined &&
                                balance > 0 &&
                                decimals && (
                                    <UnstyledButton
                                        fz={"xs"}
                                        c={"cyan"}
                                        onClick={() => {
                                            form.setFieldValue(
                                                "amount",
                                                formatUnits(balance, decimals),
                                            );
                                        }}
                                        data-testid="max-button"
                                    >
                                        Max
                                    </UnstyledButton>
                                )}
                        </Group>
                    </Stack>
                </Stack>

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
                        confirmationMessage="Withdrawal sent successfully!"
                        defaultErrorMessage={execute.error?.message}
                    />
                </Collapse>

                <Group justify="right">
                    <Button
                        variant="filled"
                        disabled={!debouncedCanSubmit}
                        leftSection={<FaEthereum />}
                        loading={debouncedLoading}
                        onClick={() =>
                            execute.writeContract(prepare.data!.request)
                        }
                    >
                        WITHDRAW (L1)
                    </Button>
                    <Button
                        variant="outline"
                        disabled={!form.isValid()}
                        leftSection={<FaEthereum />}
                        loading={debouncedLoading}
                        onClick={withdrawEtherL2}
                    >
                        WITHDRAW (L2)
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
