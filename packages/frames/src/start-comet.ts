import {
    getFrameMessage,
    getFrameMetadata,
    FrameTransactionResponse,
    getFrameHtmlResponse,
} from "@coinbase/onchainkit/frame";

export interface StartCometFrameParams {
    endpointBaseUrl: string;
}

export const _getStartCometFrameMetadata = <T>({
    endpointBaseUrl,
}: StartCometFrameParams) => {
    return getFrameMetadata({
        buttons: [
            {
                action: "link",
                label: "Start",
                target: `${endpointBaseUrl}/api/comet/start`,
            },
        ],
        image: {
            src: "https://pbs.twimg.com/profile_images/1801339115935268864/myUfQhBo_400x400.jpg",
            aspectRatio: "1:1",
        },
    }) as T;
};

/**
 * Return the next frame
 */
export const _getStartCometHTMLResponse = (body: any) => {
    return getFrameHtmlResponse({
        buttons: [
            {
                action: "tx",
                label: "submit",
                target: "/api/comet/submit-text",
                postUrl: "/api/comet/success",
            },
        ],
        input: {
            text: "Add your text here",
        },
        image: {
            src: "/submit-rules.jpg",
        },
    });
};
