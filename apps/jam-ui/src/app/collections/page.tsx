import { Stack } from "@mantine/core";
import { Metadata } from "next";
import { FaTags } from "react-icons/fa";
import PageTitle from "../../components/layout/pageTitle";
import { VouchersView } from "../../components/vouchers/VouchersView";

export const metadata: Metadata = {
    title: "Jam - My Collections",
};

export default function JamsPage() {
    return (
        <Stack>
            <PageTitle title="My Collections" Icon={FaTags} />
            <VouchersView />
        </Stack>
    );
}
