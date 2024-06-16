import {
    prepareFrameMessage,
    prepareFrameTransactionResponse,
} from "@jam/frames";
import { NextRequest, NextResponse } from "next/server";
import { encodeFunctionData, parseEther, stringToHex } from "viem";
import { sepolia } from "viem/chains";

const abi = [
    {
        inputs: [
            {
                internalType: "contract IInputBox",
                name: "_inputBox",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [],
        name: "EtherTransferFailed",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_dapp",
                type: "address",
            },
            {
                internalType: "bytes",
                name: "_execLayerData",
                type: "bytes",
            },
        ],
        name: "depositEther",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [],
        name: "getInputBox",
        outputs: [
            {
                internalType: "contract IInputBox",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];

const ETHPORTAL_CONTRACT_ADDR = "0xFfdbe43d4c855BF7e0f105c400A50857f53AB044";
const HONEYPOT_CONTRACT_ADDR = "0x4cA2f6935200b9a782A78f408F640F17B29809d8";

async function getResponse(req: NextRequest): Promise<NextResponse | Response> {
    const request = await req.json();
    console.log("Request", request);
    const neynarApiKey = process.env.NEYNAR_ONCHAIN_KIT_API_KEY || "";

    const { isValid } = (await prepareFrameMessage({
        req: request,
        apiKey: neynarApiKey,
    })) as { isValid: boolean };

    console.log("isValid", isValid);

    if (!isValid) {
        return new NextResponse("Message not valid", { status: 500 });
    }

    // TODO how to get rid of it?
    const execLayerData = stringToHex(
        JSON.stringify({
            msg: "anything",
        }),
    );
    const data = encodeFunctionData({
        abi,
        functionName: "depositEther",
        args: [HONEYPOT_CONTRACT_ADDR, execLayerData],
    });

    const chainId = `eip155:${sepolia.id}`;
    const ethValue = parseEther("0.00004").toString(); // 0.00004 ETH
    const txData = prepareFrameTransactionResponse({
        chainId,
        data,
        toAddress: ETHPORTAL_CONTRACT_ADDR,
        ethValue,
    });

    return NextResponse.json(txData);
}

export async function POST(req: NextRequest): Promise<Response> {
    return getResponse(req);
}

export const dynamic = "force-dynamic";
