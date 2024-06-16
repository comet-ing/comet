import { Stack } from "@mantine/core";
import { FaRegLightbulb } from "react-icons/fa";
import PageTitle from "../components/layout/pageTitle";
import { prepareDonateFrameMetadata } from "@jam/frames";
import type { Metadata } from "next";

export const metadata: Metadata = prepareDonateFrameMetadata({
    endpointBaseUrl: "https://jam-twt-jam-ui.vercel.app",
});

export default function HomePage() {
    return (
        <Stack>
            <PageTitle title="Jam House" Icon={FaRegLightbulb} />
        </Stack>
    );
}
