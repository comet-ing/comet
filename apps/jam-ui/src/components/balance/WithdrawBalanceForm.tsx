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
import { FC, useEffect } from "react";
import { FaEthereum } from "react-icons/fa";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useApplicationAddress } from "../../hooks/useApplicationAddress";
import { useChainId } from "../../hooks/useChainId";
import useEspressoSequencer from "../../hooks/useEspressoSequencer";
import { CenteredErrorMessage } from "../CenteredErrorMessage";

export interface Props {
    onSuccess?: () => void;
    balance: bigint;
}

export const WithdrawBalanceForm: FC<Props> = ({ onSuccess, balance }) => {
    const { chain, address: account } = useAccount();
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
    });

    const appAddress = useApplicationAddress();
    const { amount } = form.getTransformedValues();
    const chainId = useChainId();

    const { status, error, submitTransaction, reset } = useEspressoSequencer({
        chainId,
        appAddress,
        account,
    });

    useEffect(() => {
        if (status === "success") {
            reset();
            form.reset();

            if (onSuccess !== undefined && onSuccess instanceof Function) {
                onSuccess();
            }
        }
    }, [status, onSuccess, form, reset]);

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

                <Collapse in={status === "error"}>
                    <CenteredErrorMessage
                        message={error?.message ?? "Something went wrong!"}
                    />
                </Collapse>

                <Group justify="right">
                    <Button
                        variant="outline"
                        disabled={!form.isValid()}
                        leftSection={<FaEthereum />}
                        loading={status === "loading"}
                        onClick={() =>
                            submitTransaction({
                                action: "eth.withdraw",
                                amount: parseUnits(
                                    amount.toString(),
                                    decimals,
                                ).toString(),
                            })
                        }
                    >
                        WITHDRAW
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
