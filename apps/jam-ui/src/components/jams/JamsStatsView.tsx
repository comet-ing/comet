"use client";
import {
    Center,
    Group,
    NumberFormatter,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Title,
    useMantineTheme,
} from "@mantine/core";
import { FC } from "react";
import { CenteredErrorMessage } from "../CenteredErrorMessage";
import { CenteredLoaderBars } from "../CenteredLoaderBars";
import { InfoMessage } from "../InfoMessage";
import { useListJamsStats } from "./queries";

export const JamsStatsView: FC = () => {
    const { data, isLoading, error } = useListJamsStats();
    const theme = useMantineTheme();

    if (isLoading) {
        return <CenteredLoaderBars />;
    }

    if (error) return <CenteredErrorMessage message={error.message} />;

    if (!data)
        return (
            <Center>
                <InfoMessage
                    title="Humm!"
                    message="Something is floating in the space. Check us later!"
                />
            </Center>
        );

    if (data.length === 0)
        return (
            <Center>
                <InfoMessage
                    title="Where are the comets?"
                    message="Be the first to create a Comet!"
                />
            </Center>
        );

    console.log(data);

    return (
        <SimpleGrid cols={{ base: 1, md: 2 }}>
            {data.map((stats) => (
                <Paper key={stats.jamID} p="xl">
                    <Stack>
                        <Title order={3}>{stats.name}</Title>

                        <Group justify="space-between">
                            <Stack align="center">
                                <Text c="dimmed">Score</Text>
                                <Text variant="gradient">{stats.score}</Text>
                            </Stack>

                            <Stack align="center">
                                <Text c="dimmed">Mints</Text>
                                <Text variant="gradient">
                                    {stats.numTotalMints}
                                </Text>
                            </Stack>

                            <Stack align="center">
                                <Text c="dimmed">Total Minted</Text>
                                <Text variant="gradient">
                                    <NumberFormatter
                                        suffix=" ETH"
                                        value={stats.totalMintAmount}
                                        thousandSeparator
                                    />
                                </Text>
                            </Stack>
                        </Group>
                    </Stack>
                </Paper>
            ))}
        </SimpleGrid>
    );
};
