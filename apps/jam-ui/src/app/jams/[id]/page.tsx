import { getStartCometFrameMetadata } from "@jam/frames";
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
        metadata.other = getStartCometFrameMetadata({
            endpointBaseUrl: process.env.WEB_APP_BASE_URL,
            cometId: params.id,
        });
    } catch (error) {
        metadata.title = `Cometing - ${params.id}`;
    }

    return metadata;
}

async function getJam(appId: string) {
    try {
        const id = parseInt(appId);
        const jam = await fetchJamById(id);
        return jam;
    } catch (error: any) {
        console.log(error.message);
        return null;
    }
}

const JamPage: FC<PageProps> = async ({ params }) => {
    const jam = await getJam(params.id);
    const pageTitle = !jam
        ? "A stray comet perhaps..."
        : jam.name ?? "Comet Details";

    console.log(params);
    return (
        <Stack>
            <PageTitle title={pageTitle} Icon={FaPencilAlt} iconSize={28} />
            <JamDetails jamId={parseInt(params.id)} />
        </Stack>
    );
};

export default JamPage;
