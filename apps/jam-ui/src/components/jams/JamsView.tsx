"use client";
import {
    Alert,
    Button,
    Center,
    Group,
    Loader,
    Modal,
    SegmentedControl,
    Stack,
    Text,
    Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { FaExclamationCircle, FaMeteor } from "react-icons/fa";
import { useAccount } from "wagmi";
import { ListJams } from "./ListJams";
import { CreateJamForm } from "./forms/Create";
import { jamKeys, useListJams } from "./queries";
import { JamListFilter } from "./types";

export default function JamsView() {
    const { isConnected } = useAccount();
    const [filter, setFilter] = useState<JamListFilter>("all");
    const [showCreateForm, { open: openModal, close: closeModal }] =
        useDisclosure(false);
    const queryClient = useQueryClient();

    const onSuccess = useCallback(() => {
        notifications.show({
            withCloseButton: true,
            autoClose: false,
            color: "green",
            title: "Success",
            message: "Comet Created",
        });
        closeModal();

        queryClient.invalidateQueries({
            queryKey: jamKeys.lists(),
        });
    }, [closeModal, queryClient]);

    const { data, error, isLoading } = useListJams(filter);
    const jams = data ?? [];

    return (
        <Stack>
            <Group justify="space-between">
                <SegmentedControl
                    color="haiti"
                    data={[
                        { label: "All", value: "all" },
                        { label: "Join", value: "open" },
                        { label: "Mint", value: "closed" },
                    ]}
                    value={filter}
                    onChange={(value) => {
                        setFilter(value as JamListFilter);
                    }}
                />
                <Tooltip
                    disabled={isConnected}
                    label="Connect to be able to create a Comet"
                    withArrow
                    multiline
                    w={200}
                >
                    <Button
                        variant="filled"
                        onClick={openModal}
                        disabled={!isConnected}
                        rightSection={<FaMeteor />}
                    >
                        CREATE COMET
                    </Button>
                </Tooltip>
            </Group>

            {isLoading ? (
                <Center>
                    <Loader type="bars" />
                </Center>
            ) : error ? (
                <Alert
                    variant="light"
                    title="Alert title"
                    icon={<FaExclamationCircle />}
                >
                    {error.message}
                </Alert>
            ) : jams.length ? (
                <ListJams jams={jams} />
            ) : (
                <Center>
                    <Text fw={600} size="xl">
                        No Comets found!
                    </Text>
                </Center>
            )}

            <Modal
                opened={showCreateForm}
                onClose={closeModal}
                title="Create a Comet"
            >
                <CreateJamForm onSuccess={onSuccess} />
            </Modal>
        </Stack>
    );
}
