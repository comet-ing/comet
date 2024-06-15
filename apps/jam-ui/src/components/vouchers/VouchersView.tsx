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
import { FC, useEffect } from "react";
import { formatEther } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import {
    useReadCartesiDAppWasVoucherExecuted,
    useSimulateCartesiDAppExecuteVoucher,
    useWriteCartesiDAppExecuteVoucher,
} from "../../generated/wagmi-rollups";
import { useApplicationAddress } from "../../hooks/useApplicationAddress";
import { CenteredErrorMessage } from "../CenteredErrorMessage";
import { CenteredLoaderBars } from "../CenteredLoaderBars";
import { InfoMessage } from "../InfoMessage";
import { dummyProof } from "./functions";
import { UserVoucher, useGetUserVouchers } from "./queries";
import { Voucher } from "./types";

const ExecuteButton: FC<{ voucher: Voucher }> = ({ voucher }) => {
    const appAddress = useApplicationAddress();

    const {
        data: wasExecuted,
        error: wasExecutedError,
        isLoading: isCheckingVoucherStatus,
        refetch: recheckVoucherStatus,
    } = useReadCartesiDAppWasVoucherExecuted({
        args: [BigInt(voucher.input.index), BigInt(voucher.index)],
        address: appAddress,
    });

    const proof = voucher.proof ?? dummyProof;
    const { validity } = proof;
    const { inputIndexWithinEpoch, outputIndexWithinInput } = validity;

    const prepare = useSimulateCartesiDAppExecuteVoucher({
        args: [
            voucher.destination,
            voucher.payload,
            {
                ...proof,
                validity: {
                    ...validity,
                    inputIndexWithinEpoch: BigInt(inputIndexWithinEpoch),
                    outputIndexWithinInput: BigInt(outputIndexWithinInput),
                },
            },
        ],
        address: appAddress,
        query: {
            enabled: voucher.proof !== null && voucher.proof !== undefined,
        },
    });

    const execute = useWriteCartesiDAppExecuteVoucher();
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
            recheckVoucherStatus();
        }
    }, [wait.isSuccess, recheckVoucherStatus]);

    if (wasExecutedError !== null) {
        return <Badge color="red">{wasExecutedError.message}</Badge>;
    }

    if (isCheckingVoucherStatus) {
        return <Badge color="orange">Checking execution status...</Badge>;
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
            <Text>Mint for Jam {userVoucher.value}</Text>
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

    if (!isConnected) {
        return (
            <Center>
                <InfoMessage
                    title="Not connected"
                    message={"Connect to check your collections"}
                />
            </Center>
        );
    }

    if (isLoading) {
        return <CenteredLoaderBars />;
    }

    if (error) {
        return <CenteredErrorMessage message={error.message} />;
    }

    if (!data) {
        return (
            <CenteredErrorMessage message="There are no vouchers to be presented" />
        );
    }

    if (data.length === 0) {
        return (
            <Center>
                <InfoMessage
                    title="No vouchers"
                    message={`Could not find vouchers for account ${address}`}
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
