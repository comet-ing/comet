import { getFrameHtmlResponse } from "@coinbase/onchainkit/frame";

export const _getSubmitTextFrameMetadata = (
    web_app_url: string,
    cometId: string,
) => {
    return getFrameHtmlResponse({
        buttons: [
            {
                action: "tx",
                label: "submit",
                target: `${web_app_url}/api/comet/submit-text?cometId=${cometId}`,
                postUrl: `${web_app_url}/api/comet/success`,
            },
        ],
        input: {
            text: "Add your text here",
        },
        image: {
            src: `${web_app_url}/submit-rules.jpg`,
        },
    });
};
