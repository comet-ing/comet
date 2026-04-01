// XXX even though ethers is not used in the code below, it's very likely
// it will be used by any DApp, so we are already including it here
import { etherPortalAddress } from "@cartesi/viem/abi";
import { createApp } from "@deroll/app";
import { createWallet } from "@deroll/wallet";
import {
    encodeFunctionData,
    getAddress,
    hexToString,
    padHex,
    parseEther,
    slice,
    stringToHex,
} from "viem";
import Jam from "./JamManager.js";

import nftContractAbi from "./SimpleERC1155ABI.js";

// Create the application
const app = createApp({
    baseUrl: process.env.ROLLUP_HTTP_SERVER_URL || "http://127.0.0.1:5004",
});

// Set smart contract addresses as per network
var ether_portal_address = getAddress(etherPortalAddress);

/**
 * @deprecated
 */
var dapp_address_relay_contract = getAddress(
    "0xF5DE34d6BbC0446E2a45719E718efEbaaE179daE",
);

/**
 * Set by input-added event. Used globally.
 */
var nft_erc1155_address = "";

// Instantiate wallet for the rollup accounts
const wallet = createWallet();

const errorMessage = (error) =>
    error instanceof Error ? error.message : String(error);

// Main advance request handler
app.addAdvanceHandler(async ({ metadata, payload }) => {
    try {
        const sender = getAddress(metadata.msg_sender);
        // TODO: add a mint condition when user already has in-app balance i.e. minting via L2 msg.
        // ether deposit handling
        if (sender === ether_portal_address) {
            console.log("Received ether deposit request.");
            try {
                // Use the wallet's handler to process the deposit
                await wallet.handler({ metadata, payload });
                console.log("Ether deposit processed successfully.");
            } catch (error) {
                console.error(
                    `Ether deposit failed: ${errorMessage(error)}`,
                );
                return "reject";
            }

            let input_data = [];
            input_data[0] = getAddress(slice(payload, 0, 20));
            input_data[1] = slice(payload, 20, 52);

            if (payload.length > 53 * 2) {
                // ether deposit with execution payload
                input_data[2] = slice(payload, 52);
            } else {
                // ether deposit without execution payload
                return "accept";
            }
            let etherDepositExecJSON;
            try {
                etherDepositExecJSON = JSON.parse(hexToString(input_data[2]));
            } catch (error) {
                console.warn(
                    "Invalid ether deposit execution payload; treating as simple deposit.",
                );
                return "accept";
            }

            if (
                etherDepositExecJSON.action === "jam.mint" &&
                nft_erc1155_address
            ) {
                console.log(
                    `Processing mint request for jam ${etherDepositExecJSON.jamID}.`,
                );
                const jamToMint = Jam.getJamByID(etherDepositExecJSON.jamID);
                if (jamToMint === null) {
                    await app.createReport({
                        payload: stringToHex("Jam not found with given ID"),
                    });
                    return "accept";
                }
                const minterEthBalance = wallet.etherBalanceOf(input_data[0]);
                const jamMintPrice = parseEther(String(jamToMint.mintPrice));

                if (minterEthBalance >= jamMintPrice) {
                    console.log(
                        `Jam ${etherDepositExecJSON.jamID} mint approved.`,
                    );
                    const callData = encodeFunctionData({
                        abi: nftContractAbi,
                        functionName: "mint",
                        args: [input_data[0], etherDepositExecJSON.jamID],
                    });
                    console.log(
                        `Creating mint voucher for jam ${etherDepositExecJSON.jamID}.`,
                    );
                    try {
                        await app.createVoucher({
                            destination: nft_erc1155_address,
                            value: "0x0000000000000000000000000000000000000000000000000000000000000000",
                            payload: callData,
                        });
                    } catch (error) {
                        console.error(
                            `Mint voucher creation failed for jam ${etherDepositExecJSON.jamID}: ${errorMessage(error)}`,
                        );
                        await app.createReport({
                            payload: stringToHex(
                                `Error creating voucher for minting: ${error.message}`,
                            ),
                        });
                        return "reject";
                    }
                    try {
                        Jam.updateCreatorsBalance(
                            etherDepositExecJSON.jamID,
                            input_data[0],
                            wallet,
                        );
                        jamToMint.handleMintStats(jamMintPrice);
                    } catch (error) {
                        console.error(
                            `Mint settlement failed for jam ${etherDepositExecJSON.jamID}: ${errorMessage(error)}`,
                        );
                        await app.createReport({
                            payload: stringToHex(`Error: ${error.message}`),
                        });
                    }
                } else {
                    console.log(
                        `Insufficient balance to mint jam ${etherDepositExecJSON.jamID}.`,
                    );
                    await app.createReport({
                        payload: stringToHex(
                            "Insufficient balance to mint. Deposit ether.",
                        ),
                    });
                }

                return "accept";
            } else {
                console.warn(
                    "Ether deposit did not include a valid mint request; treating as simple deposit.",
                );
                return "accept";
            }
        }

        // Relay dApp address
        // TODO: Check the removal of this logic. There is no address_relay_contract anymore
        if (sender === dapp_address_relay_contract) {
            console.log("Received dapp address relay request.");
            try {
                await wallet.handler({ metadata, payload });
            } catch (error) {
                console.error(
                    `Dapp address relay failed: ${errorMessage(error)}`,
                );
                return "reject";
            }
            return "accept";
        }

        // Jam Action handling
        var input = hexToString(payload);
        input = JSON.parse(input);
        const timestamp = metadata.block_timestamp ?? Date.now();
        try {
            switch (input.action) {
                case "jam.setNFTAddress":
                    nft_erc1155_address = getAddress(input.address);
                    console.log(
                        "NFT contract address updated.",
                    );
                    break;
                case "jam.create":
                    const newJam = new Jam(
                        input.name,
                        input.description,
                        input.mintPrice,
                        input.maxEntries,
                        input.genesisEntry,
                        sender,
                        timestamp,
                    );
                    console.log(`Jam with ID ${newJam.id} was created.`);
                    break;
                case "jam.append":
                    try {
                        const jam = Jam.getJamByID(input.jamID);
                        if (!jam) {
                            throw new Error(
                                `Jam with ID ${input.jamID} not found.`,
                            );
                        }

                        Jam.appendToJamByID(
                            input.jamID,
                            sender,
                            input.entry,
                            timestamp,
                        );
                        console.log(
                            `Entry appended to jam ${input.jamID}.`,
                        );
                    } catch (error) {
                        console.error(
                            `Appending to jam ${input.jamID} failed: ${errorMessage(error)}`,
                        );
                        await app.createReport({
                            payload: stringToHex(`Error: ${error.message}`),
                        });
                        return "reject";
                    }
                    break;
                case "eth.withdraw":
                    console.log("Received ether withdrawal request.");
                    const amountToWithdraw = BigInt(input.amount);
                    try {
                        const voucher = wallet.withdrawEther(
                            sender,
                            amountToWithdraw,
                        );
                        const paddedValue = padHex(voucher.value, { size: 32 });

                        await app.createVoucher({
                            destination: voucher.destination,
                            value: paddedValue,
                            payload: voucher.payload,
                        });
                        console.log("Ether withdrawal voucher created.");
                    } catch (error) {
                        console.error(
                            `Ether withdrawal failed: ${errorMessage(error)}`,
                        );
                        await app.createReport({
                            payload: stringToHex(
                                `Error withdrawing ether: ${error.message}`,
                            ),
                        });
                        return "reject";
                    }
                    break;
                default:
                    throw new Error("Invalid input action");
            }
        } catch (error) {
            console.error(
                `Advance action processing failed: ${errorMessage(error)}`,
            );
            await app.createReport({
                payload: stringToHex(
                    `Error processing jam action: ${error.message}`,
                ),
            });
            return "reject";
        }

        return "accept";
    } catch (error) {
        console.error(`Advance handler failed: ${errorMessage(error)}`);
        await app.createReport({
            payload: stringToHex(`Error: ${error.message}`),
        });
        return "reject";
    }
});

app.addInspectHandler(async ({ payload }) => {
    try {
        const decodedPayload = hexToString(payload);
        const payloadArr = decodedPayload.split("/");

        switch (payloadArr[0]) {
            case "alljams":
                const lightJams = Jam.getAllJamsLite();
                try {
                    await app.createReport({
                        payload: stringToHex(JSON.stringify(lightJams)),
                    });
                } catch (error) {
                    console.error(
                        `Failed to serialize all jams response: ${errorMessage(error)}`,
                    );
                    await app.createReport({
                        payload: stringToHex(`Error: ${error.message}`),
                    });
                }
                break;
            case "jams":
                const jamID = payloadArr[1];
                const jamByID = Jam.getJamByID(Number(jamID));
                await app.createReport({
                    payload: stringToHex(JSON.stringify(jamByID)),
                });
                break;
            case "openjams":
                const openJams = Jam.getJamsByStatusLite("open");
                await app.createReport({
                    payload: stringToHex(JSON.stringify(openJams)),
                });
                break;
            case "closedjams":
                const closedJams = Jam.getJamsByStatusLite("closed");
                await app.createReport({
                    payload: stringToHex(JSON.stringify(closedJams)),
                });
                break;
            case "user":
                const userAddress = getAddress(payloadArr[1]);
                const creatorJams = Jam.getJamsByCreator(userAddress);
                const participantJams = Jam.getJamsByParticipant(userAddress);
                const userJams = {
                    creator: creatorJams,
                    participant: participantJams,
                };
                await app.createReport({
                    payload: stringToHex(JSON.stringify(userJams)),
                });
                break;
            case "balance":
                const balanceUserAddress = getAddress(payloadArr[1]);
                const eth_balance = wallet.etherBalanceOf(balanceUserAddress);
                console.log("Returning ether balance.");
                await app.createReport({
                    payload: stringToHex(String(eth_balance)),
                });
                break;
            case "jamstats":
                const allJamStats = Jam.getAllJamsStats();
                await app.createReport({
                    payload: stringToHex(JSON.stringify(allJamStats)),
                });
                break;
            case "nftaddress":
                const nftAddress = nft_erc1155_address
                    ? nft_erc1155_address
                    : null;
                await app.createReport({
                    payload: stringToHex(JSON.stringify({ nftAddress })),
                });
                break;
            case "nextjamid":
                const nextJamId = Jam.getNextJamId();
                await app.createReport({
                    payload: stringToHex(JSON.stringify({ nextJamId })),
                });
                break;
            default:
                throw new Error("Invalid inspect action");
        }

        return "accept";
    } catch (error) {
        console.error(`Inspect handler failed: ${errorMessage(error)}`);
        await app.createReport({
            payload: stringToHex(`Error: ${error.message}`),
        });
        return "reject";
    }
});

// Start the application
app.start().catch((e) => {
    console.error(`Application startup failed: ${errorMessage(e)}`);
    process.exit(1);
});
