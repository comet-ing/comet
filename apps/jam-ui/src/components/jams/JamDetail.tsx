"use client";
import {
    Alert,
    Anchor,
    Button,
    Card,
    Center,
    Group,
    Loader,
    Modal,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { FC, useCallback, useEffect } from "react";
import { FaCheck, FaInfoCircle } from "react-icons/fa";
import { parseUnits, stringToHex } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import {
    useSimulateEtherPortalDepositEther,
    useWriteEtherPortalDepositEther,
} from "../../generated/wagmi-rollups";
import { useApplicationAddress } from "../../hooks/useApplicationAddress";
import { CometAlert } from "../CometAlert";
import { CustomAvatar } from "./CustomAvatar";
import { ContributeJamForm } from "./forms/Contribute";
import { jamKeys, useFindJam } from "./queries";

type MintButtonProp = {
    price: number;
    jamId: number;
};

const MintButton: FC<MintButtonProp> = ({ jamId, price }) => {
    const { chain, isConnected } = useAccount();

    const address = useApplicationAddress();
    const execLayerData = stringToHex(
        JSON.stringify({
            action: "jam.mint",
            jamID: jamId,
        }),
    );
    const amount = parseUnits(
        price.toString(),
        chain?.nativeCurrency.decimals ?? 18,
    );

    const prepare = useSimulateEtherPortalDepositEther({
        args: [address, execLayerData],
        value: amount,
    });
    const execute = useWriteEtherPortalDepositEther();
    const wait = useWaitForTransactionReceipt({
        hash: execute.data,
    });

    const canSubmit = !prepare.isLoading && prepare.error === null;
    const loading = execute.isPending || wait.isLoading;

    useEffect(() => {
        if (wait.isSuccess) {
            execute.reset();
            notifications.show({
                autoClose: false,
                title: <Title order={4}>Nice!</Title>,
                message: (
                    <Group>
                        <Text>Request for mint confirmed</Text>
                        <Anchor component={Link} href="/collections">
                            Check your collections
                        </Anchor>
                    </Group>
                ),
            });
        }
    }, [execute, wait.isSuccess]);

    return (
        <Button
            variant="filled"
            disabled={!isConnected || !canSubmit}
            leftSection={<FaCheck />}
            loading={loading}
            onClick={() => execute.writeContract(prepare.data!.request)}
        >
            Mint ({price} ETH)
        </Button>
    );
};

type JamDetailsProps = {
    jamId: number;
};

export const JamDetails: FC<JamDetailsProps> = ({ jamId }) => {
    const { isConnected, address } = useAccount();
    const [showform, { open: openModal, close: closeModal }] =
        useDisclosure(false);
    const queryClient = useQueryClient();

    const onSuccess = useCallback(() => {
        notifications.show({
            withCloseButton: true,
            autoClose: false,
            color: "green",
            title: "Success",
            message: "Content added!",
        });
        closeModal();

        setTimeout(() => {
            queryClient.invalidateQueries({
                queryKey: jamKeys.base,
            });
        }, 1000);
    }, [closeModal, queryClient]);

    const { data, error, isLoading } = useFindJam(jamId);

    if (isLoading)
        return (
            <Stack>
                <Center>
                    <Loader type="bars" />
                </Center>
            </Stack>
        );

    if (error) {
        return (
            <Center>
                <CometAlert message="We're having difficulty in finding this comet details." />
            </Center>
        );
    }

    if (!data)
        return (
            <Center>
                <CometAlert
                    message={`There is no Comet with id ${jamId}! Check the list of existing Comets.`}
                />
            </Center>
        );

    const isClosed = !data.open;
    const isContributor = data.entries.some(
        (entry) => entry.address === address,
    );

    const canContribute = isConnected && !isContributor && data.open;

    return (
        <Stack>
            {isClosed && (
                <Alert variant="light" color="blue" icon={<FaInfoCircle />}>
                    This comet is not accepting any new cometing.
                </Alert>
            )}

            {data && (
                <Card mb="md">
                    <Card.Section inheritPadding py="sm">
                        <Text size="lg" fw={600}>
                            Description
                        </Text>
                    </Card.Section>
                    <Text c="dimmed">{data?.description}</Text>
                </Card>
            )}

            {!isClosed && !isConnected && (
                <Alert variant="light" color="blue" icon={<FaInfoCircle />}>
                    Connect your wallet to add to this Comet!
                </Alert>
            )}

            {!isClosed && isContributor && (
                <Alert variant="light" color="blue" icon={<FaInfoCircle />}>
                    You already comet-ed!
                </Alert>
            )}

            <Group justify="flex-end">
                <Button
                    variant="filled"
                    onClick={openModal}
                    disabled={!canContribute}
                >
                    COMETING
                </Button>
                {isClosed && (
                    <MintButton price={data.mintPrice} jamId={data.id} />
                )}
            </Group>

            {data.entries.map((entry, idx) => (
                <Card key={idx}>
                    <Text py="lg">{entry.text}</Text>
                    <Card.Section inheritPadding withBorder>
                        <Group gap={0}>
                            <Text c="dimmed" size="sm">
                                By:{" "}
                            </Text>
                            <CustomAvatar address={entry.address} size={28} />
                            {address?.toLowerCase() ===
                            entry.address.toLowerCase()
                                ? "(You)"
                                : ""}
                        </Group>
                    </Card.Section>
                </Card>
            ))}

            <Modal
                opened={showform}
                onClose={closeModal}
                title="Create content"
            >
                <ContributeJamForm onSuccess={onSuccess} jamId={jamId} />
            </Modal>
        </Stack>
    );
};
