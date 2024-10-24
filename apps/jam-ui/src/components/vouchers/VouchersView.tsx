"use client";
import {
    Badge,
    Box,
    Button,
    Card,
    Center,
    Group,
    SimpleGrid,
    Stack,
    Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { FC, useEffect } from "react";
import { formatEther } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import {
    useSimulateCartesiDAppExecuteOutput,
    useWriteCartesiDAppExecuteOutput,
} from "../../generated/wagmi-rollups";
import { useApplicationAddress } from "../../hooks/useApplicationAddress";
import { CenteredLoaderBars } from "../CenteredLoaderBars";
import { CometAlert } from "../CometAlert";
import { useGetUserVouchers, UserVoucher, voucherKeys } from "./queries";
import { Voucher } from "./types";

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
        return <Badge color="red">{prepare.error.message}</Badge>;
    }

    if (execute.error) {
        return <Badge color="red">{execute.error.message}</Badge>;
    }

    if (wasExecuted) {
        return <Badge color="green">Executed!</Badge>;
    }

    if (voucher.proof === null) {
        return <Badge color="orange">Waiting for proof...</Badge>;
    }

    if (execute === undefined) {
        return <Badge color="orange">Preparing transaction...</Badge>;
    }

    return (
        <Button
            size="compact-sm"
            loading={execute.isPending || wait.isLoading}
            onClick={() => execute.writeContract(prepare.data!.request)}
        >
            Execute
        </Button>
    );
};

interface Props {
    userVoucher: UserVoucher;
}

const MintVoucher: FC<Props> = ({ userVoucher }) => {
    return (
        <Group justify="center">
            <Text>Mint for Comet {userVoucher.value}</Text>
            <ExecuteButton voucher={userVoucher.voucher} />
        </Group>
    );
};

const WithdrawVoucher: FC<Props> = ({ userVoucher }) => {
    return (
        <Group justify="center">
            <Text>Withdraw {formatEther(BigInt(userVoucher.value))}</Text>
            <ExecuteButton voucher={userVoucher.voucher} />
        </Group>
    );
};

const Info: FC<{ userVoucher: UserVoucher }> = ({ userVoucher }) => {
    return (
        <Box
            component={Stack}
            bd="0.1px solid rgba(155, 200, 0, 0.3)"
            p="sm"
            mt="xs"
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
const VoucherList: FC<VoucherListProps> = ({ userVouchers }) => {
    return (
        <SimpleGrid cols={{ base: 1, md: 2 }}>
            <Card withBorder>
                <Center>
                    <Text size="xl">Your vouchers</Text>
                </Center>
                {userVouchers.map((userVoucher, idx) => (
                    <Info key={idx} userVoucher={userVoucher} />
                ))}
            </Card>
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
