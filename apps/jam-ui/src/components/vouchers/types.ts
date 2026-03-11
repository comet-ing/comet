import { Hash, Hex } from "viem";

export type VoucherType = "MINT" | "WITHDRAW";

export interface Validity {
    inputIndexWithinEpoch: number;
    outputIndexWithinInput: number;
    outputHashesRootHash: Hash;
    vouchersEpochRootHash: Hash;
    noticesEpochRootHash: Hash;
    machineStateHash: Hash;
    outputHashInOutputHashesSiblings: Hash[];
    outputHashesInEpochSiblings: Hash[];
}

export interface Proof {
    context: Hex;
    validity: Validity;
}

export interface Voucher {
    destination: Hex;
    executed?: boolean;
    index: number;
    /** Decoded inner payload (e.g. mint calldata) for display and decoding. */
    payload: Hex;
    /** Full output bytes as stored in the outputs Merkle tree. Required for executeOutput(). */
    rawData: Hex;
    value: Hex;
    input: {
        id: string;
        index: number;
        payload: Hex;
    };
    proof: {
        outputHashesSiblings: Hex[];
        outputIndex: string;
    };
}
