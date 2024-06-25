import { Stack } from "@mantine/core";
import { Metadata } from "next";
import Image from "next/image";
import nodeHtmlToImage from "node-html-to-image";
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
                text: "Hello my first message here with some big text",
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

    const content = `
        <html>
            <head>
                <style>
                    html {
                     background-color: ${haiti[9]}
                    }
                    body {
                        width: 400px;
                        height: 400px;                         
                    }
                    p {
                        color: ${downy[2]};
                        text-align:center;
                    }
                </style>
            </head>
            <body>
                ${addParagraphs(data.entries)}
            </body>
        </html>
    `;

    return await nodeHtmlToImage({
        html: content,
        encoding: "base64",
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
