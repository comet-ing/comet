import {
    getFrameMessage,
    getFrameMetadata,
    FrameTransactionResponse,
    getFrameHtmlResponse,
} from "@coinbase/onchainkit/frame";

export interface PrepareDonateFrameMetadataOpts {
    endpointBaseUrl: string;
}

export const prepareDonateFrameMetadata = <T>({
    endpointBaseUrl,
}: PrepareDonateFrameMetadataOpts) => {
    const frameMetadata = getFrameMetadata({
        buttons: [
            {
                action: "tx",
                label: "Donate 0.00004 sepoliaETH",
                target: `${endpointBaseUrl}/api/donate/prepare`,
                postUrl: `${endpointBaseUrl}/api/donate/handletx`,
            },
            {
                action: "link",
                label: "Learn more",
                target: endpointBaseUrl,
            },
        ],
        image: {
            src: "https://pbs.twimg.com/profile_images/1801339115935268864/myUfQhBo_400x400.jpg",
            aspectRatio: "1:1",
        },
    });

    return {
        title: "Comet",
        description: "Text co-creation platform",
        openGraph: {
            title: "Comet",
            description: "Text co-creation platform",
            images: [
                "https://pbs.twimg.com/profile_images/1801339115935268864/myUfQhBo_400x400.jpg",
            ],
        },
        other: {
            ...frameMetadata,
        },
    } as T;
};

// ===============

export interface PrepareFrameMessageOpts {
    req: any;
    apiKey: string;
}

export const prepareFrameMessage = async <T>({
    req,
    apiKey,
}: PrepareFrameMessageOpts) => {
    if (apiKey === "") {
        return getFrameMessage(req) as T;
    } else {
        return getFrameMessage(req, {
            neynarApiKey: apiKey,
        }) as T;
    }
};

// =============================

export interface FrameTransactionResponseOpts {
    chainId: string;
    data: string;
    toAddress: string;
    ethValue: string;
}

export const prepareFrameTransactionResponse = ({
    chainId,
    data,
    toAddress,
    ethValue,
}: FrameTransactionResponseOpts) => {
    return {
        chainId,
        method: "eth_sendTransaction",
        params: {
            abi: [],
            data,
            to: toAddress,
            value: ethValue, // TODO Is it needed?
        },
    } as FrameTransactionResponse;
};

// =============================

export const prepareFrameHTMLResponse = (body: any) => {
    return getFrameHtmlResponse({
        buttons: [
            {
                label: `Tx: ${body?.untrustedData?.transactionId || "--"}`,
            },
        ],
        image: {
            src: "https://egs-group.in/wp-content/uploads/2017/02/payment-successful.png",
        },
    });
};
