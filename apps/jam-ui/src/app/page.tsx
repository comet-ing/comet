import { Group, Stack, Title } from "@mantine/core";
import type { Metadata } from "next";
import { FaChartSimple } from "react-icons/fa6";
import { JamsStatsView } from "../components/jams/JamsStatsView";

export const metadata: Metadata = {
    title: "Comet",
    description: "Text co-creation platform",
    openGraph: {
        title: "Comet",
        description: "Text co-creation platform",
        images: [
            "https://pbs.twimg.com/profile_images/1801339115935268864/myUfQhBo_400x400.jpg",
        ],
    },
};

export default function HomePage() {
    return (
        <Stack>
            <Group mb="sm" align="center">
                <FaChartSimple size={40} />
                <Title order={2} style={{ alignSelf: "end" }}>
                    Comet Leaderboard
                </Title>
            </Group>
            <JamsStatsView />
        </Stack>
    );
}
