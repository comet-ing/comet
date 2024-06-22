"use client";
import {
    Card,
    Center,
    NumberFormatter,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Title,
    useMantineColorScheme,
} from "@mantine/core";
import { FC } from "react";
import { CenteredLoaderBars } from "../CenteredLoaderBars";
import { CometAlert } from "../CometAlert";
import { useListJamsStats } from "./queries";

export const JamsStatsView: FC = () => {
    const { data, isLoading, error } = useListJamsStats();
    const { colorScheme } = useMantineColorScheme();
    const cardTitleColor = colorScheme === "light" ? "white" : "";

    if (error) console.log(error.message);

    if (isLoading) {
        return <CenteredLoaderBars />;
    }

    if (error)
        return (
            <Center>
                <CometAlert message="We are having troubles fetching the Comet stats at the moment." />
            </Center>
        );

    if (!data)
        return (
            <Center>
                <CometAlert message="Something is floating in space. Check us later!" />
            </Center>
        );

    if (data.length === 0)
        return (
            <Center>
                <CometAlert
                    title="Where are the comets?"
                    message="Be the first to create a Comet!"
                />
            </Center>
        );

    return (
        <SimpleGrid cols={{ base: 1, md: 2 }}>
            {data.map((stats) => (
                <Paper key={stats.jamID} p="xl" bg="haiti" radius="lg">
                    <Stack>
                        <Title order={3} c={cardTitleColor}>
                            {stats.name}
                        </Title>

                        <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>
                            <Stats title="Score" value={stats.score} />

                            <Stats
                                title="Mints"
                                value={stats.numTotalMints.toString()}
                            />

                            <Stats
                                title="Total Minted"
                                value={stats.totalMintAmount}
                                suffix=" ETH"
                            />
                        </SimpleGrid>
                    </Stack>
                </Paper>
            ))}
        </SimpleGrid>
    );
};

const Stats: FC<{
    title: string;
    value: string;
    suffix?: string;
    prefix?: string;
}> = ({ title, value, suffix, prefix }) => {
    return (
        <Card radius="lg">
            <Stack align="center">
                <Text fw="500">{title}</Text>
                <Text>
                    <NumberFormatter
                        suffix={suffix}
                        prefix={prefix}
                        value={value}
                        thousandSeparator
                    />
                </Text>
            </Stack>
        </Card>
    );
};
