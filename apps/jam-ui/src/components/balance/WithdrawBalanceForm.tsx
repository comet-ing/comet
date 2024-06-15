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
import { FC, useEffect } from "react";
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
            const payload = {
                action: "eth.withdraw",
                amount: values.amount,
            };

            if (values.amount !== "") {
                hexInput = stringToHex(JSON.stringify(payload));
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
                        WITHDRAW
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
