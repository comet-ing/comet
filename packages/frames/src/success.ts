import { getFrameHtmlResponse } from "@coinbase/onchainkit/frame";

export const _getSuccessFrameMetadata = (web_app_url: string) => {
    return getFrameHtmlResponse({
        buttons: [
            {
                label: "Done",
            },
        ],
        image: {
            src: `${web_app_url}/success.jpg`,
        },
    });
};
