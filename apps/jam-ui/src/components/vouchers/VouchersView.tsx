"use client";
import {
    Badge,
    Box,
    Button,
    Card,
    Center,
    Group,
    NumberFormatter,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { FC, useEffect, useMemo } from "react";
import { formatEther } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import {
    useSimulateCartesiDAppExecuteOutput,
    useWriteCartesiDAppExecuteOutput,
} from "../../generated/wagmi-rollups";
import { useApplicationAddress } from "../../hooks/useApplicationAddress";
import { CenteredLoaderBars } from "../CenteredLoaderBars";
import { CometAlert } from "../CometAlert";
import { useFindJam } from "../jams/queries";
import { useGetUserVouchers, UserVoucher, voucherKeys } from "./queries";
import { Voucher, VoucherType } from "./types";

const isNotNullOrUndefined = (value: any) =>
    value !== null && value !== undefined;
const refetchUserVouchers = (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: voucherKeys.lists() });

const ExecuteButton: FC<{ voucher: Voucher }> = ({ voucher }) => {
    const appAddress = useApplicationAddress();
    const wasExecuted = voucher.executed;
    const queryClient = useQueryClient();

    const prepare = useSimulateCartesiDAppExecuteOutput({
        args: [
            voucher.payload,
            {
                ...voucher.proof,
                outputIndex: BigInt(voucher.proof.outputIndex),
            },
        ],
        address: appAddress,
        query: {
            enabled:
                isNotNullOrUndefined(voucher.proof) &&
                isNotNullOrUndefined(voucher.proof.outputHashesSiblings) &&
                isNotNullOrUndefined(voucher.proof.outputIndex),
        },
    });

    const execute = useWriteCartesiDAppExecuteOutput();
    const wait = useWaitForTransactionReceipt({
        hash: execute.data,
    });

    useEffect(() => {
        if (wait.isSuccess) {
            notifications.show({
                title: "Success",
                message: "The voucher was executed.",
                autoClose: 3000,
            });

            refetchUserVouchers(queryClient);
        }
    }, [wait.isSuccess, queryClient]);

    if (prepare.error) {
        return (
            <Badge color="red" radius={0}>
                {prepare.error.message}
            </Badge>
        );
    }

    if (execute.error) {
        return (
            <Badge color="red" radius={0}>
                {execute.error.message}
            </Badge>
        );
    }

    if (wasExecuted) {
        return (
            <Badge color="green" radius={0}>
                Executed!
            </Badge>
        );
    }

    if (voucher.proof === null) {
        return (
            <Badge color="orange" radius={0}>
                Waiting for proof...
            </Badge>
        );
    }

    if (execute === undefined) {
        return (
            <Badge color="orange" radius={0}>
                Preparing transaction...
            </Badge>
        );
    }

    return (
        <Button
            h="100%"
            loading={execute.isPending || wait.isLoading}
            onClick={() => execute.writeContract(prepare.data!.request)}
            radius={0}
        >
            Execute
        </Button>
    );
};

interface Props {
    userVoucher: UserVoucher;
}

const MintVoucher: FC<Props> = ({ userVoucher }) => {
    const { data, isLoading, error } = useFindJam(parseInt(userVoucher.value));
    const text = isLoading || error ? userVoucher.value : data?.name;

    return (
        <Group justify="space-between" wrap="nowrap">
            <Stack gap={0} p="sm" w="60%">
                <Title style={{ textOverflow: "ellipsis", overflow: "hidden" }}>
                    {text}
                </Title>
                <Badge bg="kidnapper">
                    <Text size="xs">Mint</Text>
                </Badge>
            </Stack>
            <ExecuteButton voucher={userVoucher.voucher} />
        </Group>
    );
};

const WithdrawVoucher: FC<Props> = ({ userVoucher }) => {
    return (
        <Group justify="space-between" wrap="nowrap">
            <Stack gap={0} p="sm">
                <Title>
                    <NumberFormatter
                        value={formatEther(BigInt(userVoucher.value))}
                        thousandSeparator
                        suffix=" eth"
                    />
                </Title>
                <Badge m={0} variant="light">
                    <Text size="xs">Withdraw</Text>
                </Badge>
            </Stack>
            <ExecuteButton voucher={userVoucher.voucher} />
        </Group>
    );
};

const Info: FC<{ userVoucher: UserVoucher }> = ({ userVoucher }) => {
    return (
        <Box
            component={Stack}
            bd="0.1px solid rgba(155, 200, 0, 0.3)"
            p="0"
            mt="xs"
            miw={{ base: "100%", md: "210px" }}
        >
            {userVoucher.type === "MINT" ? (
                <MintVoucher userVoucher={userVoucher} />
            ) : userVoucher.type === "WITHDRAW" ? (
                <WithdrawVoucher userVoucher={userVoucher} />
            ) : (
                ""
            )}
        </Box>
    );
};
interface VoucherListProps {
    userVouchers: UserVoucher[];
}

type VoucherGroup = {
    [k in VoucherType]: UserVoucher[];
};

const VoucherList: FC<VoucherListProps> = ({ userVouchers }) => {
    const voucherGroup = useMemo(() => {
        return userVouchers.reduce((prev, curr): VoucherGroup => {
            const list = prev[curr.type] ?? [];
            list.push(curr);

            return {
                ...prev,
                [curr.type]: list,
            };
        }, {} as VoucherGroup);
    }, userVouchers);

    return (
        <SimpleGrid cols={{ base: 1, md: 2 }}>
            {voucherGroup.WITHDRAW && (
                <Card withBorder>
                    <Center>
                        <Text size="xl">Your withdrawables</Text>
                    </Center>

                    {voucherGroup.WITHDRAW && (
                        <SimpleGrid cols={{ base: 1 }}>
                            {voucherGroup.WITHDRAW.map((withdrawable, idx) => (
                                <Info
                                    key={`withdrawable-${idx}`}
                                    userVoucher={withdrawable}
                                />
                            ))}
                        </SimpleGrid>
                    )}
                </Card>
            )}

            {voucherGroup.MINT && (
                <Card withBorder>
                    <Center>
                        <Text size="xl">Your Mintables</Text>
                    </Center>

                    {voucherGroup.MINT && (
                        <SimpleGrid cols={{ base: 1 }}>
                            {voucherGroup.MINT.map((mintable, idx) => (
                                <Info
                                    key={`mintable-${idx}`}
                                    userVoucher={mintable}
                                />
                            ))}
                        </SimpleGrid>
                    )}
                </Card>
            )}
        </SimpleGrid>
    );
};

export const VouchersView: FC = () => {
    const { address, isConnected } = useAccount();
    const { data, isLoading, error } = useGetUserVouchers(address);

    if (error) console.log(error.message);

    if (!isConnected) {
        return (
            <Center>
                <CometAlert
                    title="Not connected!"
                    message="Connect to check your collections"
                />
            </Center>
        );
    }

    if (isLoading) {
        return <CenteredLoaderBars />;
    }

    if (error) {
        return (
            <Center>
                <CometAlert message="We're not able to get your collections at the moment." />
            </Center>
        );
    }

    if (!data) {
        return (
            <Center>
                <CometAlert message="There are no vouchers to be presented" />
            </Center>
        );
    }

    if (data.length === 0) {
        return (
            <Center>
                <CometAlert
                    title="No Vouchers!"
                    message={`We could not find vouchers for account ${address}`}
                />
            </Center>
        );
    }

    return (
        <Stack>
            <VoucherList userVouchers={data} />
        </Stack>
    );
};
