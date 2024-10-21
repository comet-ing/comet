import React, { useState, useEffect } from "react";
import { InputBox__factory } from "@cartesi/rollups";

import { getClient, getWalletClient, INodeComponentProps } from "./utils/chain";

import configFile from "./config.json";
import { PublicClient, toHex } from "viem";

const config: any = configFile;

export const Input: React.FC<INodeComponentProps> = (props: INodeComponentProps) => {

    const [chainId, setChainId] = useState<string>();


    useEffect(() => {
        if (!props.chain) {
            return;
        }
        setChainId(props.chain);
    }, [props.chain]);


    const addInput = async (str: string) => {
        if (chainId) {
            const client: PublicClient|null = await getClient(chainId);
            const walletClient = await getWalletClient(chainId);

            if (!client || !walletClient) return;

            const [address] = await walletClient.requestAddresses();
            if (!address) return;
            try {
                let payload = toHex(str);
                if (hexInput) {
                    payload = str as `0x${string}`;
                }

                const { request } = await client.simulateContract({
                    account: address,
                    address: config.contracAddresses.InputBox as `0x${string}`,
                    abi: InputBox__factory.abi,
                    functionName: 'addInput',
                    args: [props.appAddress, payload]
                });
                const txHash = await walletClient.writeContract(request);
            
                await client.waitForTransactionReceipt( 
                    { hash: txHash }
                )
            } catch (e) {
                console.log(e);
            }
        }
    };

    const l2DevNonceUrl = "http://localhost:8080/nonce"
    const l2DevSendTransactionUrl = "http://localhost:8080/submit"

    let typedData = {
        domain: {
            name: "Cartesi",
            version: "0.1.0",
            chainId: BigInt(parseInt(props.chain.substring(2) ?? "0", 16)),
            verifyingContract:
                "0x0000000000000000000000000000000000000000",
        } as const,
        types: {
            EIP712Domain: [
                { name: "name", type: "string" },
                { name: "version", type: "string" },
                { name: "chainId", type: "uint256" },
                { name: "verifyingContract", type: "address" },
            ],
            CartesiMessage: [
                { name: "app", type: "address" },
                { name: "nonce", type: "uint64" },
                { name: "max_gas_price", type: "uint128" },
                { name: "data", type: "bytes" },
            ],
        } as const,
        primaryType: "CartesiMessage" as const,
        message: {
            app: "0x" as `0x${string}`,
            nonce: BigInt(0),
            data: "0x" as `0x${string}`,
            max_gas_price: BigInt(10)
        },
    }

    const fetchNonceL2 = async (user: any, application: any) => {
        const response = await fetch(l2DevNonceUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ msg_sender: user, app_contract: application })
        });

        const responseData = await response.json();
        const nextNonce = responseData.nonce;
        return nextNonce
    }

    const submitTransactionL2 = async (fullBody: any) => {
        const body = JSON.stringify(fullBody)
        const response = await fetch(l2DevSendTransactionUrl, {
            method: 'POST',
            body,
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            console.log("submit to L2 failed")
            throw new Error("submit to L2 failed: " + response.text())
        } else {
            return response.json()
        }
    }

    const addTransactionL2 = async (str: string) => {
        if (chainId) {
            const walletClient = await getWalletClient(chainId);
            if (!walletClient) return;
            const [account] = await walletClient.requestAddresses();
            if (!account) { return; }

            let payload = toHex(str);
            if (hexInput) {
                payload = str as `0x${string}`;
            }

            const app = props.appAddress;
            const nonce = await fetchNonceL2(account, app);
            typedData.message = {
                app,
                nonce,
                data: payload,
                max_gas_price: BigInt(10),
            }
            try {
                setCartesiTxId("");
                const signature = await walletClient.signTypedData({ account, ...typedData });
                const l2data = JSON.parse(JSON.stringify({
                    typedData,
                    account,
                    signature,
                }, (_, value) =>
                    typeof value === 'bigint'
                        ? parseInt(value.toString())
                        : value // return everything else unchanged
                ));
                const res = await submitTransactionL2(
                    l2data
                );
                setCartesiTxId(res.id);
            } catch (e) {
                console.log(`${e}`);
            }
        }
    };

    const [input, setInput] = useState<string>("");
    const [hexInput, setHexInput] = useState<boolean>(false);
    const [hexCartesiInput, setHexCartesiInput] = useState<boolean>(false);
    const [l2Data, setL2Data] = useState<string>("");
    const [cartesiTxId, setCartesiTxId] = useState<string>("");

    return (
        <div>
            <div>
                Send L1 Input <br />
                Input: <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <input type="checkbox" checked={hexInput} onChange={(_) => setHexInput(!hexInput)} /><span>Raw Hex </span>
                <button onClick={() => addInput(input)} disabled={!chainId}>
                    Send
                </button>
                <br /><br />
            </div>
            <div>
                Send L2 EIP-712 Input <br />
                Input: <input
                    type="text"
                    value={l2Data}
                    onChange={(e) => setL2Data(e.target.value)}
                />
                <input type="checkbox" checked={hexCartesiInput} onChange={(_) => setHexCartesiInput(!hexCartesiInput)} /><span>Raw Hex </span>
                <button onClick={() => addTransactionL2(l2Data)} disabled={!chainId}>
                    Send
                </button>
                <br />
                {cartesiTxId && <div>Input ID: {cartesiTxId}</div>}
                <br />
            </div>
        </div>
    );
};