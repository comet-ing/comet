import { createImageFromContent } from "@jam/image-generator";
import { Stack } from "@mantine/core";
import { Metadata } from "next";
import Image from "next/image";
import { downy, haiti } from "../../providers/colors";

export const metadata: Metadata = {
    title: "Cometing - Imaginarium",
};

function addParagraphs(list: { text: string; address: string }[]) {
    let text = "";
    list.forEach((item) => {
        text += `<p>${item.text}</p>`;
    });
    return text;
}

async function createImgFromTextOfComet(cometId: number) {
    // dummy structure to resemble the comet-info returned.
    const data = {
        entries: [
            {
                text: "Hello world from genesis content!!!",
                address: "0x000000000",
            },
            { text: "Hello my second message here", address: "0x000000000" },
            { text: "Hello my third message here", address: "0x000000000" },
            { text: "Hello my fourth message here", address: "0x000000000" },
            { text: "Hello message here", address: "0x000000000" },
            { text: "Hello message here", address: "0x000000000" },
            { text: "Hello message here", address: "0x000000000" },
            // add more text to check the truncation effect
        ],
    };
    const mappedContent = data.entries.map((value) => value.text);

    return await createImageFromContent(mappedContent, {
        backgroundColor: haiti[9] as `#${string}`,
        textColor: downy[2] as `#${string}`,
        height: "400px",
        width: "400px",
    });
}

export default async function JamsPage() {
    // Used for example of backend generated base64 image.
    // the whole page will be deleted before merging the branch.
    const base64Img = await createImgFromTextOfComet(1);
    return (
        <Stack>
            <h1>Generated images goes here!</h1>
            <Image
                src={`data:image/jpeg;base64,${base64Img}`}
                alt="Some auto generated image in the backend"
                width={400}
                height={400}
            />
        </Stack>
    );
}