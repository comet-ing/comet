import { Stack } from "@mantine/core";
import { FC } from "react";
import { FaPencilAlt } from "react-icons/fa";
import { JamDetails } from "../../../components/jams/JamDetail";
import PageTitle from "../../../components/layout/pageTitle";

type PageProps = {
    params: { id: string };
};

const JamPage: FC<PageProps> = ({ params }) => {
    console.log(params);
    return (
        <Stack>
            <PageTitle title="JAM Details" Icon={FaPencilAlt} iconSize={28} />
            <JamDetails jamId={parseInt(params.id)} />
        </Stack>
    );
};

export default JamPage;
