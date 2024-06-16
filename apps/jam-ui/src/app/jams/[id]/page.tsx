import { Stack } from "@mantine/core";
import { Metadata } from "next";
import { FC } from "react";
import { FaPencilAlt } from "react-icons/fa";
import { JamDetails } from "../../../components/jams/JamDetail";
import { fetchJamById } from "../../../components/jams/fetchers";
import PageTitle from "../../../components/layout/pageTitle";

type PageProps = {
    params: { id: string };
};

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const metadata: Metadata = {};
    try {
        const id = parseInt(params.id);
        const jam = await fetchJamById(id);
        metadata.title = `Cometing - ${jam.name}`;
        if (jam.description) {
            metadata.description = jam.description;
        }
    } catch (error) {
        metadata.title = `Cometing - ${params.id}`;
    }

    return metadata;
}

const JamPage: FC<PageProps> = ({ params }) => {
    console.log(params);
    return (
        <Stack>
            <PageTitle title="Comet Details" Icon={FaPencilAlt} iconSize={28} />
            <JamDetails jamId={parseInt(params.id)} />
        </Stack>
    );
};

export default JamPage;
