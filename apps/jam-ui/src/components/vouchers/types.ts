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
    payload: Hex;
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
