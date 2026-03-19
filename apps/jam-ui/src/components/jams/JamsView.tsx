"use client";
import {
    Button,
    Center,
    Group,
    Loader,
    Modal,
    Pagination,
    SegmentedControl,
    Stack,
    Text,
    Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { FaMeteor } from "react-icons/fa";
import { useAccount } from "wagmi";
import { CometAlert } from "../CometAlert";
import { ListJams } from "./ListJams";
import { CreateJamForm } from "./forms/Create";
import { jamKeys, useListJams } from "./queries";
import { JamListFilter } from "./types";

const JAMS_PAGE_SIZE = 24;

export default function JamsView() {
    const { isConnected } = useAccount();
    const [filter, setFilter] = useState<JamListFilter>("all");
    const [page, setPage] = useState(1);
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

        setTimeout(() => {
            queryClient.invalidateQueries({
                queryKey: jamKeys.lists(),
            });
        }, 1000);
    }, [closeModal, queryClient]);

    const { data, error, isLoading } = useListJams(filter);
    const jams = data ?? [];

    if (error) console.log(error.message);

    const total = jams.length;
    const totalPages = Math.ceil(total / JAMS_PAGE_SIZE);
    const safePage = Math.min(page, totalPages || 1);
    const pageStart = (safePage - 1) * JAMS_PAGE_SIZE;
    const jamsOnPage = jams.slice(pageStart, pageStart + JAMS_PAGE_SIZE);

    // If data shrinks (e.g. after creation/invalidation), clamp page into range.
    useEffect(() => {
        if (totalPages > 0 && page > totalPages) setPage(totalPages);
    }, [totalPages, page]);

    // Reset paging when changing the filter.
    useEffect(() => {
        setPage(1);
    }, [filter]);

    return (
        <Stack>
            <Group>
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
                        leftSection={<FaMeteor />}
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
                <CometAlert message="We are having trouble finding the Comets at the moment." />
            ) : jams.length ? (
                <>
                    <ListJams jams={jamsOnPage} />
                    {totalPages > 1 && (
                        <Center mt="lg">
                            <Pagination
                                total={totalPages}
                                value={safePage}
                                onChange={(value) => setPage(value)}
                                color="haiti"
                            />
                        </Center>
                    )}
                </>
            ) : (
                <Center>
                    <Text fw={600} size="xl">
                        No comets found!
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
