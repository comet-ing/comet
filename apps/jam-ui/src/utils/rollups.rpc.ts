import { createCartesiPublicClient } from "@cartesi/viem";
import { http } from "viem";
import type { Address } from "viem";
import type { Voucher } from "../components/vouchers/types";

const getRpcUrl = () => {
    const url = process.env.NEXT_PUBLIC_ROLLUPS_ENDPOINT;
    if (!url) {
        throw new Error(
            "Missing NEXT_PUBLIC_ROLLUPS_ENDPOINT. Set it in .env or .env.local (e.g. http://localhost:6751) and restart the dev server.",
        );
    }
    return url.endsWith("/rpc") ? url : `${url.replace(/\/$/, "")}/rpc`;
};

let client: ReturnType<typeof createCartesiPublicClient> | null = null;

/**
 * Get a Cartesi L2 public client for JSON-RPC (listOutputs, getOutput, etc.).
 * Uses NEXT_PUBLIC_ROLLUPS_ENDPOINT for the base URL and appends /rpc.
 */
export function getRollupsPublicClient() {
    if (!client) {
        client = createCartesiPublicClient({
            transport: http(getRpcUrl()),
        });
    }
    return client;
}

/**
 * Map an Output from cartesi_listOutputs (decoded as Voucher) to our app Voucher type.
 * Exported for use with @cartesi/wagmi useOutputs data.
 * Uses rawData (full output bytes) for executeOutput(); payload is the decoded inner calldata for display.
 */
export function outputToVoucher(
    output: {
        index: bigint;
        inputIndex: bigint;
        epochIndex: bigint;
        rawData: `0x${string}`;
        outputHashesSiblings: readonly `0x${string}`[] | null;
        decodedData: { type: "Voucher"; destination: Address; value: bigint; payload: `0x${string}` };
        executionTransactionHash: `0x${string}` | null;
    },
): Voucher {
    const decoded = output.decodedData;
    const valueHex = `0x${decoded.value.toString(16).padStart(64, "0")}` as `0x${string}`;
    return {
        index: Number(output.index),
        destination: decoded.destination,
        payload: decoded.payload,
        rawData: output.rawData,
        value: valueHex,
        executed: !!output.executionTransactionHash,
        input: {
            id: `${output.epochIndex}-${output.inputIndex}`,
            index: Number(output.inputIndex),
            payload: "0x" as `0x${string}`,
        },
        proof: {
            outputHashesSiblings: [...(output.outputHashesSiblings ?? [])],
            outputIndex: String(output.index),
        },
    };
}

/**
 * Fetch all vouchers for an application via JSON-RPC (cartesi_listOutputs).
 * Filters to outputs of type Voucher and maps to our Voucher shape.
 */
export async function fetchVouchersByApplication(
    application: Address,
    limit = 200,
    offset = 0,
): Promise<Voucher[]> {
    const publicClient = getRollupsPublicClient();
    const { data } = await publicClient.listOutputs({
        application,
        limit,
        offset,
    });

    const vouchers: Voucher[] = [];
    for (const output of data) {
        if (output.decodedData.type === "Voucher") {
            vouchers.push(
                outputToVoucher({
                    index: output.index,
                    inputIndex: output.inputIndex,
                    epochIndex: output.epochIndex,
                    rawData: output.rawData,
                    outputHashesSiblings: output.outputHashesSiblings,
                    decodedData: output.decodedData,
                    executionTransactionHash: output.executionTransactionHash,
                }),
            );
        }
    }
    return vouchers;
}
