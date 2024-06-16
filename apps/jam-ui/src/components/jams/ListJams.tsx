"use client";

import {
    Avatar,
    Badge,
    Card,
    Group,
    SimpleGrid,
    Text,
    Title,
} from "@mantine/core";
import Link from "next/link";
import { FC } from "react";
import { CustomAvatar } from "./CustomAvatar";
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

export const ListJams: FC<ListProps> = ({ jams }) => {
    return (
        <SimpleGrid cols={{ base: 1, md: 2 }}>
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
                            <Badge color={jam.open ? "haiti" : "kidnapper"}>
                                {jam.open ? "Join" : "Mint"}
                            </Badge>
                        </Group>
                    </Card.Section>

                    <Card.Section inheritPadding mih="5rem" py="md">
                        <Text size="lg" lineClamp={3}>
                            {jam.description}
                        </Text>
                    </Card.Section>
                    <Card.Section mt="lg" inheritPadding>
                        <Group justify="space-between">
                            <CollabGroup jam={jam} />
                            <Group>
                                <Text size="sm" c="dimmed">
                                    Entries{" "}
                                    {`${jam.entries.length}/${jam.maxEntries}`}
                                </Text>
                            </Group>
                        </Group>
                    </Card.Section>
                </Card>
            ))}
        </SimpleGrid>
    );
};
