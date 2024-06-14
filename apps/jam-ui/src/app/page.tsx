import { Stack } from "@mantine/core";
import { FaRegLightbulb } from "react-icons/fa";
import PageTitle from "../components/layout/pageTitle";

export default function HomePage() {
    return (
        <Stack>
            <PageTitle title="Jam House" Icon={FaRegLightbulb} />
        </Stack>
    );
}
