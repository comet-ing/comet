"use client";

import {
    Alert,
    Avatar,
    Badge,
    Card,
    Center,
    Group,
    Loader,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import Link from "next/link";
import { FC } from "react";
import { FaExclamationCircle } from "react-icons/fa";
import { CustomAvatar } from "./CustomAvatar";
import { useListJams } from "./queries";
import { Jam } from "./types";

type ListProps = {
    jams: Jam[];
};

type CollabGroupProp = {
    jam: Jam;
};

const CollabGroup: FC<CollabGroupProp> = ({ jam }) => {
    return (
        <Group gap={0}>
            <Text c="dimmed" size="sm">
                Collaborators:
            </Text>
            <Avatar.Group>
                {jam.entries.map(({ address }, idx) => (
                    <CustomAvatar key={idx} address={address} size={30} />
                ))}
            </Avatar.Group>
        </Group>
    );
};

const List: FC<ListProps> = ({ jams }) => {
    return (
        <SimpleGrid cols={{ xs: 1, md: 2 }}>
            {jams.map((jam, index) => (
                <Card
                    key={index}
                    shadow="md"
                    component={Link}
                    href={`jams/${jam.id}`}
                >
                    <Card.Section inheritPadding withBorder py="xs">
                        <Group justify="space-between">
                            <Title order={3}>{jam.name}</Title>
                            <Badge color={jam.open ? "green" : "red"}>
                                {jam.open ? "Open" : "Finalized"}
                            </Badge>
                        </Group>
                    </Card.Section>

                    <Text size="lg" mt="sm">
                        {jam.description}
                    </Text>
                    <Card.Section px="md" mt="lg">
                        <Group justify="space-between">
                            <CollabGroup jam={jam} />
                            <Group>
                                <Text size="sm" c="dimmed">
                                    Entries{" "}
                                    {`${jam.entries.length}/${jam.maxEntries}`}
                                </Text>
                                <Text></Text>
                            </Group>
                        </Group>
                    </Card.Section>
                </Card>
            ))}
        </SimpleGrid>
    );
};

export const ListJams: FC = () => {
    const { data, error, isLoading } = useListJams();
    const jams = data ?? [];

    return (
        <Stack justify="center">
            {isLoading ? (
                <Loader type="bars" />
            ) : error ? (
                <Alert
                    variant="light"
                    title="Alert title"
                    icon={<FaExclamationCircle />}
                >
                    {error.message}
                </Alert>
            ) : jams.length ? (
                <List jams={jams} />
            ) : (
                <Center>
                    <Text fw={600} size="xl">
                        Create the first JAM!
                    </Text>
                </Center>
            )}
        </Stack>
    );
};
