import {
    createPublicClient,
    createWalletClient,
    custom,
    http,
    PublicClient,
    WalletClient,
} from "viem";
import "viem/window";

import { anvil, Chain, mainnet, sepolia } from "viem/chains";

export interface INodeComponentProps {
    appAddress: `0x${string}`;
    chain: string;
}

let chains: Record<number, Chain> = {};
chains[mainnet.id] = mainnet;
chains[sepolia.id] = sepolia;
chains[anvil.id] = anvil;

export function getChain(chainId: number): Chain | null;
export function getChain(chainId: string): Chain | null;
export function getChain(chainId: number | string): Chain | null {
    if (typeof chainId === "string") {
        // if (!isHex(chainId)) return null;
        // chainId = fromHex(chainId, "number");
        chainId = parseInt(chainId);
    }

    const chain = chains[chainId];
    if (!chain) return null;

    return chain;
}

export async function getClient(chainId: string): Promise<PublicClient | null> {
    const chain = getChain(chainId);
    if (!chain) return null;
    return createPublicClient({
        chain: chain,
        transport: http(),
    });
}

export async function getWalletClient(
    chainId: string,
): Promise<WalletClient | null> {
    console.log(window.ethereum);
    if (!window.ethereum) return null;
    const chain = getChain(chainId);
    if (!chain) return null;

    const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
    });
    return createWalletClient({
        account: accounts[0],
        chain: chain,
        transport: custom(window.ethereum),
    });
}
