import { Stack } from "@mantine/core";
import { Metadata } from "next";
import { FaHandshake } from "react-icons/fa";
import JamsView from "../../components/jams/JamsView";
import PageTitle from "../../components/layout/pageTitle";

export const metadata: Metadata = {
    title: "Cometing - Comets",
};

export default function JamsPage() {
    return (
        <Stack>
            <PageTitle title="Collaboration Space" Icon={FaHandshake} />
            <JamsView />
        </Stack>
    );
}
