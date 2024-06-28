import {
    getFrameMessage,
    FrameTransactionResponse,
} from "@coinbase/onchainkit/frame";

interface PrepareFrameMessageOpts {
    req: any;
    apiKey: string;
}

const prepareFrameMessage = async <T>({
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

//=================================

export interface FrameTransactionResponseOpts {
    chainId: string;
    data: string;
    toAddress: string;
    ethValue: string;
}

export const _prepareFrameTransactionResponse = <FrameTransactionResponse>({
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

//=================================

interface FrameMessage {
    isValid: boolean;
    message: any;
}

export const _validateRequestMessage = async <T>(request: any) => {
    const neynarApiKey = process.env.NEYNAR_ONCHAIN_KIT_API_KEY || "";
    const { isValid, message } = (await prepareFrameMessage({
        req: request,
        apiKey: neynarApiKey,
    })) as FrameMessage;
    return { isValid, message: message.input } as T;
};
