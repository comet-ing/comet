"use client";
import { Button, Group, Modal, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useCallback } from "react";
import { useAccount } from "wagmi";
import { ListJams } from "./ListJams";
import { CreateJamForm } from "./createForm";

export default function JamsView() {
    const { isConnected } = useAccount();
    const [showCreateForm, { open: openModal, close: closeModal }] =
        useDisclosure(false);

    const onSuccess = useCallback(() => {
        notifications.show({
            withCloseButton: true,
            autoClose: false,
            color: "green",
            title: "Success",
            message: "JAM Created",
        });

        closeModal();
    }, [closeModal]);

    return (
        <Stack>
            <Group justify="flex-end">
                <Button variant="filled" onClick={openModal}>
                    CREATE JAM
                </Button>
            </Group>

            <ListJams />

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
