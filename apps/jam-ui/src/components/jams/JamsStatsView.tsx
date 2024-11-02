"use client";
import {
    Button,
    Card,
    Center,
    Container,
    Group,
    NumberFormatter,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Title,
    useMantineColorScheme,
} from "@mantine/core";

import Link from "next/link";
import { FC } from "react";
import { FaEye } from "react-icons/fa";
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
        <Container
            fluid
            w={{ base: "95%", sm: "85%", lg: "75%" }}
            px={{ base: 3, sm: 8 }}
        >
            {data.map((stats) => (
                <Paper key={stats.jamID} p="xl" radius="sm" my="sm" bg="haiti">
                    <Stack>
                        <Group justify="space-between">
                            <Title order={3} c={cardTitleColor}>
                                {stats.name}
                            </Title>
                            <Button
                                variant="subtle"
                                component={Link}
                                href={`jams/${stats.jamID}`}
                                rightSection={<FaEye size={18} />}
                                c={cardTitleColor}
                            >
                                <Title order={4}>View</Title>
                            </Button>
                        </Group>

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
        </Container>
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
