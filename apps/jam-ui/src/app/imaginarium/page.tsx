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
    const data = {
        entries: [
            {
                text: "Hello world from genesis content!!!",
                address: "0x000000000",
            },
            { text: "Hello my second message here", address: "0x000000000" },
            { text: "Hello my third message here", address: "0x000000000" },
            { text: "Hello my fourth message here", address: "0x000000000" },
            { text: "Hello my first message here", address: "0x000000000" },
            { text: "Hello my first message here", address: "0x000000000" },
            { text: "Hello my first message here", address: "0x000000000" },
            { text: "Hello my first message here", address: "0x000000000" },
            { text: "Hello my first message here", address: "0x000000000" },
            { text: "Hello my first message here", address: "0x000000000" },
            { text: "Hello my first message here", address: "0x000000000" },
            { text: "Hello my first message here", address: "0x000000000" },
            { text: "Hello my first message here", address: "0x000000000" },
            { text: "Hello my first message here", address: "0x000000000" },
        ],
    };
    const mappedContent = data.entries.map((value) => value.text);

    return await createImageFromContent(mappedContent, {
        backgroundColor: haiti[9] as `#${string}`,
        textColor: downy[2] as `#${string}`,
        converterOptions: {
            encoding: "base64",
            puppeteerArgs: {
                headless: true,
                args: [
                    "--no-sandbox",
                    "--remote-debugging-address=0.0.0.0",
                    "--remote-debugging-port=9222",
                ],
            },
        },
    });
}

export default async function JamsPage() {
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
