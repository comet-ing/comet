import { Stack } from "@mantine/core";
import { Metadata } from "next";
import { FaHandshake } from "react-icons/fa";
import JamsView from "../../components/jams/JamsView";
import PageTitle from "../../components/layout/pageTitle";

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

export default function JamsPage() {
    return (
        <Stack>
            <PageTitle title="Collaboration Space" Icon={FaHandshake} />
            <JamsView />
        </Stack>
    );
}
