import { Hex } from "viem";

export type JamListFilter = "all" | "closed" | "open";

export interface JamStats {
    jamID: number;
    name: string;
    numTotalMints: number;
    totalMintAmount: string;
    score: string;
}
export interface JamEntry {
    address: Hex;
    text: string;
}

export interface Jam {
    id: number;
    maxEntries: number;
    mintPrice: number;
    name: string;
    open: boolean;
    creatorAddress: Hex;
    description: string;
    entries: JamEntry[];
}
