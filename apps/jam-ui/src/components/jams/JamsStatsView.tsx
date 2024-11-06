"use client";
import {
    Button,
    Card,
    Center,
    Container,
    Flex,
    getGradient,
    getThemeColor,
    Group,
    NumberFormatter,
    Table,
    Text,
    Title,
    useMantineColorScheme,
    useMantineTheme,
} from "@mantine/core";

import Link from "next/link";
import { FC, useMemo } from "react";
import { FaEye } from "react-icons/fa";
import { theme } from "../../providers/theme";
import { CenteredLoaderBars } from "../CenteredLoaderBars";
import { CometAlert } from "../CometAlert";
import { useListJamsStats } from "./queries";
import { JamStats } from "./types";

const getBackgroundColourByRank = (rank: number) => {
    switch (rank) {
        case 0:
            return "haiti.8";
        case 1:
            return "haiti.5";
        case 2:
            return "haiti.3";
        default:
            return "inherit";
    }
};

const getTextColourByRank = (rank: number) => {
    switch (rank) {
        case 0:
        case 1:
        case 2:
            return "white";
        default:
            return "inherit";
    }
};

const Leaderboard: FC<{ jamStats: JamStats[] }> = ({ jamStats }) => {
    const theme = useMantineTheme();
    const shadowConfig = {
        boxShadow: `0px 8px 5px -5px ${getThemeColor("grey", theme)}`,
    };

    const rows = useMemo(
        () =>
            jamStats.map((stats, idx) => (
                <Table.Tr
                    key={idx}
                    style={{
                        ...shadowConfig,
                        textAlign: "center",
                    }}
                    bg={getBackgroundColourByRank(idx)}
                >
                    <Table.Td>
                        <Text
                            c={getTextColourByRank(idx)}
                            size="1.5rem"
                            fw="500"
                        >
                            {idx + 1}
                        </Text>
                    </Table.Td>
                    <Table.Td>
                        <Text fw="bold" c={getTextColourByRank(idx)}>
                            {stats.name}
                        </Text>
                    </Table.Td>
                    <Table.Td>
                        <Text
                            fw="bolder"
                            size="xl"
                            c={getTextColourByRank(idx)}
                        >
                            {stats.totalContributors}
                        </Text>
                    </Table.Td>
                    <Table.Td>
                        <Text
                            fw="bolder"
                            size="xl"
                            c={getTextColourByRank(idx)}
                        >
                            {stats.numTotalMints}
                        </Text>{" "}
                    </Table.Td>
                    <Table.Td>
                        <Text
                            fw="bolder"
                            size="xl"
                            c={getTextColourByRank(idx)}
                        >
                            <NumberFormatter
                                value={stats.totalMintAmount}
                                thousandSeparator
                                suffix=" eth"
                            />
                        </Text>
                    </Table.Td>
                    <Table.Td>
                        <Text
                            fw="bolder"
                            size="xl"
                            c={getTextColourByRank(idx)}
                        >
                            <NumberFormatter
                                value={stats.score}
                                decimalScale={2}
                            />
                        </Text>
                    </Table.Td>
                </Table.Tr>
            )),
        [jamStats],
    );

    return (
        <Table.ScrollContainer minWidth={theme.breakpoints.sm}>
            <Table
                id="comet-leaderboard"
                withRowBorders={false}
                style={{ borderCollapse: "separate", borderSpacing: "0 15px" }}
            >
                <Table.Thead>
                    <Table.Tr style={shadowConfig}>
                        <Table.Th style={{ textAlign: "center" }}>
                            <Text fw="lighter">RANK</Text>
                        </Table.Th>
                        <Table.Th style={{ textAlign: "center" }}>
                            <Text fw="lighter">NAME</Text>
                        </Table.Th>
                        <Table.Th style={{ textAlign: "center" }}>
                            <Text fw="lighter">CONTRIBUTORS</Text>
                        </Table.Th>
                        <Table.Th style={{ textAlign: "center" }}>
                            <Text fw="lighter">MINTS</Text>
                        </Table.Th>
                        <Table.Th style={{ textAlign: "center" }}>
                            <Text fw="lighter">TOTAL EARNED</Text>
                        </Table.Th>
                        <Table.Th style={{ textAlign: "center" }}>
                            <Text fw="lighter">SCORE</Text>
                        </Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
        </Table.ScrollContainer>
    );
};

const sortByScore = (stats: JamStats[]) =>
    stats.sort((a, b) => {
        const scoreA = Number(a.score);
        const scoreB = Number(b.score);
        return scoreA < scoreB ? 1 : scoreA > scoreB ? -1 : 0;
    });

export const JamsStatsView: FC = () => {
    const { data, isLoading, error } = useListJamsStats();

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
            w={{ base: "95%", sm: "89%", lg: "75%" }}
            px={{ base: 3, sm: 8 }}
        >
            <Leaderboard jamStats={sortByScore(data)} />
        </Container>
    );
};

const CardStatsView: FC<{ data: JamStats[] }> = ({ data }) => {
    return (
        <>
            {data.map((stats) => (
                <Card
                    key={`card-${stats.jamID}`}
                    p="xl"
                    radius="sm"
                    my="sm"
                    maw="960px"
                >
                    <Card.Section inheritPadding py="xs">
                        <Group justify="space-between">
                            <Title order={3}>{stats.name}</Title>
                            <Button
                                variant="subtle"
                                component={Link}
                                href={`jams/${stats.jamID}`}
                                rightSection={<FaEye size={18} />}
                            >
                                <Title order={4}>View</Title>
                            </Button>
                        </Group>
                    </Card.Section>

                    <Flex
                        justify={{
                            base: "center",
                            md: "space-between",
                        }}
                        wrap="wrap"
                        gap="sm"
                    >
                        <CardStats title="Score" value={stats.score} />

                        <CardStats
                            title="Contributors"
                            value={stats.totalContributors.toString()}
                        />

                        <CardStats
                            title="Mints"
                            value={stats.numTotalMints.toString()}
                        />

                        <CardStats
                            title="Total Minted"
                            value={stats.totalMintAmount}
                            suffix=" eth"
                        />
                    </Flex>
                </Card>
            ))}
        </>
    );
};

const CardStats: FC<{
    title: string;
    value: string;
    suffix?: string;
    prefix?: string;
}> = ({ title, value, prefix, suffix }) => {
    const { colorScheme } = useMantineColorScheme();
    const gradConfig =
        colorScheme === "dark"
            ? { deg: 120, from: "haiti.9", to: "haiti.3" }
            : { deg: 90, from: "haiti.1", to: "haiti.5" };
    const gradient = getGradient(gradConfig, theme);

    return (
        <Card bg={gradient} miw={{ base: "100%", md: "200px" }}>
            <Title>
                <NumberFormatter
                    suffix={suffix}
                    prefix={prefix}
                    value={value}
                    thousandSeparator
                />
            </Title>
            <Text>{title}</Text>
        </Card>
    );
};
