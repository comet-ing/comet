import {
    prepareFrameTransactionResponse,
    validateRequestMessage,
} from "@jam/frames";
import { NextRequest, NextResponse } from "next/server";
import { encodeFunctionData, parseEther, stringToHex, isHex } from "viem";

const abi = [
    {
        inputs: [],
        name: "InputSizeExceedsLimit",
        type: "error",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "dapp",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "inputIndex",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                indexed: false,
                internalType: "bytes",
                name: "input",
                type: "bytes",
            },
        ],
        name: "InputAdded",
        type: "event",
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
                name: "_input",
                type: "bytes",
            },
        ],
        name: "addInput",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_dapp",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "_index",
                type: "uint256",
            },
        ],
        name: "getInputHash",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_dapp",
                type: "address",
            },
        ],
        name: "getNumberOfInputs",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];

async function getResponse(req: NextRequest): Promise<NextResponse | Response> {
    const request = await req.json();
    const { isValid, message } = (await validateRequestMessage(request)) as {
        isValid: boolean;
        message: string;
    };

    if (!isValid) {
        return NextResponse.json(
            { error: "Message not valid" },
            { status: 500 },
        );
    }
    if (message === undefined || !message) {
        return NextResponse.json(
            { error: "Empty string received" },
            { status: 500 },
        );
    }

    const { searchParams } = new URL(req.url);
    const cometId: string | null = searchParams.get("cometId");
    if (!cometId) {
        return new NextResponse("cometId is undefined", { status: 500 });
    }

    const userText = message;
    const appendTextCommand = {
        action: "jam.append",
        jamID: cometId,
        entry: userText,
    };
    const input = stringToHex(JSON.stringify(appendTextCommand));

    const COMET_CONTRACT_ADDR = process.env.NEXT_PUBLIC_APP_ADDRESS;
    const data = encodeFunctionData({
        abi,
        functionName: "addInput",
        args: [COMET_CONTRACT_ADDR, input],
    });

    const INPUTBOX_CONTRACT_ADDR = process.env.INPUTBOX_CONTRACT_ADDRESS;
    const chainId = `eip155:${process.env.NEXT_PUBLIC_CHAIN_ID}`;
    const ethValue = parseEther("0").toString();
    const txData = prepareFrameTransactionResponse({
        chainId,
        data,
        toAddress: INPUTBOX_CONTRACT_ADDR,
        ethValue,
    });

    return NextResponse.json(txData);
}

export async function POST(req: NextRequest): Promise<Response> {
    return getResponse(req);
}

export const dynamic = "force-dynamic";
