import { Address, Hash, Hex } from "viem";

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
    index: number;
    input: { index: number };
    destination: Address;
    payload: Hex;
    proof?: Proof;
}
