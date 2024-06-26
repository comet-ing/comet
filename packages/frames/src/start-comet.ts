import { getFrameMetadata } from "@coinbase/onchainkit/frame";

export interface StartCometFrameParams {
    endpointBaseUrl: string;
    cometId: string;
}

export const _getStartCometFrameMetadata = <T>({
    endpointBaseUrl,
    cometId,
}: StartCometFrameParams) => {
    return getFrameMetadata({
        buttons: [
            {
                action: "post",
                label: "Start",
                target: `${endpointBaseUrl}/api/comet/start/`,
            },
        ],
        image: {
            src: `${endpointBaseUrl}/start.jpg`,
        },
    }) as T;
};
