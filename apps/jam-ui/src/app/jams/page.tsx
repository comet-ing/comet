import { Stack, Title } from "@mantine/core";
import { Metadata } from "next";
import { FaHandshake } from "react-icons/fa";
import PageTitle from "../../components/layout/pageTitle";

export const metadata: Metadata = {
    title: "Jams",
};

export default function JamsPage() {
    return (
        <Stack>
            <PageTitle title="Collaboration Space" Icon={FaHandshake} />
            <Title order={4}>Create a JAM</Title>
            <Title order={4}>List of latest n active JAMS goes here</Title>
        </Stack>
    );
}
