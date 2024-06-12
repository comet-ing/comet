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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { FaExclamationCircle } from "react-icons/fa";
import { useAccount } from "wagmi";
import { ListJams } from "./ListJams";
import { CreateJamForm } from "./createForm";
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
            message: "JAM Created",
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
                    data={[
                        { label: "All", value: "all" },
                        { label: "Open", value: "open" },
                        { label: "Closed", value: "closed" },
                    ]}
                    value={filter}
                    onChange={(value) => {
                        setFilter(value as JamListFilter);
                    }}
                />
                <Button variant="filled" onClick={openModal}>
                    CREATE JAM
                </Button>
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
                        No JAMS found!
                    </Text>
                </Center>
            )}

            <Modal
                opened={showCreateForm}
                onClose={closeModal}
                title="Create a JAM"
            >
                <CreateJamForm onSuccess={onSuccess} />
            </Modal>
        </Stack>
    );
}
