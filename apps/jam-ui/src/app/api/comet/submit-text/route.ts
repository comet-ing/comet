import {
    validateRequestMessage,
    prepareFrameTransactionResponse,
} from "@jam/frames";
import { NextRequest, NextResponse } from "next/server";
import { encodeFunctionData, parseEther, stringToHex } from "viem";
import { baseSepolia } from "viem/chains";

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

const INPUTBOX_CONTRACT_ADDR = "0x59b22D57D4f067708AB0c00552767405926dc768";
const COMET_CONTRACT_ADDR = "0x56D9baA89f84ebdA027BcA24950F61Fc6DABd16E";

async function getResponse(req: NextRequest): Promise<NextResponse | Response> {
    const request = await req.json();
    const isValid = await validateRequestMessage(request);

    if (!isValid) {
        return new NextResponse("Message not valid", { status: 500 });
    }

    const textToAppend = {
        action: "jam.append",
        jamID: 0,
        entry: "Skies are blue",
    };
    const input = stringToHex(JSON.stringify(textToAppend));

    const data = encodeFunctionData({
        abi,
        functionName: "addInput",
        args: [COMET_CONTRACT_ADDR, input],
    });

    const chainId = `eip155:${baseSepolia.id}`;
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
