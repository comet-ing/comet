import { prepareDonateFrameMetadata } from "@jam/frames";
import { Group, Stack, Title } from "@mantine/core";
import type { Metadata } from "next";
import { FaChartSimple } from "react-icons/fa6";
import { JamsStatsView } from "../components/jams/JamsStatsView";

export const metadata: Metadata = prepareDonateFrameMetadata({
    endpointBaseUrl: process.env.WEB_APP_BASE_URL,
});

export default function HomePage() {
    return (
        <Stack>
            <Group mb="sm" align="center">
                <FaChartSimple size={40} />
                <Title order={2} style={{ alignSelf: "end" }}>
                    Comet Stats
                </Title>
            </Group>
            <JamsStatsView />
        </Stack>
    );
}
