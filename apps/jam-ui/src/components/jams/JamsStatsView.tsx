"use client";
import {
    Button,
    Card,
    Center,
    Container,
    Flex,
    getGradient,
    Group,
    NumberFormatter,
    Text,
    Title,
    useMantineColorScheme,
} from "@mantine/core";

import Link from "next/link";
import { FC } from "react";
import { FaEye } from "react-icons/fa";
import { theme } from "../../providers/theme";
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
                <>
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
                            wrap={{ base: "wrap", md: "nowrap" }}
                            gap="sm"
                        >
                            <CardStats title="Score" value={stats.score} />

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
                </>
            ))}
        </Container>
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
