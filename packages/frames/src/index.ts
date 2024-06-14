import { getFrameMetadata } from "@coinbase/onchainkit/frame";

export interface PrepareMetadataOpts {
    url: string;
    jamId: string;
}

export const prepareFrameMetadata = <T>({ url }: PrepareMetadataOpts) => {
    const frameMetadata = getFrameMetadata({
        buttons: [
            {
                label: "Story time",
            },
            {
                action: "tx",
                label: "Send Base Sepolia",
                target: `${url}/api/tx`,
                postUrl: `${url}/api/tx-success`,
            },
        ],
        image: {
            src: `${url}/park-3.png`,
            aspectRatio: "1:1",
        },
        input: {
            text: "Tell me a story",
        },
        postUrl: `${url}/api/frame`,
    });

    return {
        title: "zizzamia.xyz",
        description: "LFG",
        openGraph: {
            title: "zizzamia.xyz",
            description: "LFG",
            images: [`${url}/park-1.png`],
        },
        other: {
            ...frameMetadata,
        },
    } as T;
};
