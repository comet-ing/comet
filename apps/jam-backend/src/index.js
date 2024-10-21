// XXX even though ethers is not used in the code below, it's very likely
// it will be used by any DApp, so we are already including it here
import {
    hexToString,
    stringToHex,
    getAddress,
    slice,
    encodeFunctionData,
    parseEther,
  } from "viem";
  import Jam from "./JamManager.js";
  import { createApp } from "@deroll/app";
  import { createWallet } from "@deroll/wallet";
  
  import nftContractAbi from "./SimpleERC1155ABI.js";
  
  // Create the application
  const app = createApp({
    url: process.env.ROLLUP_HTTP_SERVER_URL || "http://127.0.0.1:5004",
  });
  
  // Set smart contract addresses as per network
  var ether_portal_address = getAddress(
    "0xfa2292f6D85ea4e629B156A4f99219e30D12EE17",
  );
  var dapp_address_relay_contract = getAddress(
    "0xF5DE34d6BbC0446E2a45719E718efEbaaE179daE",
  );
  var dapp_address = getAddress(
    "0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e",
  );
  var nft_erc1155_address = "";
  
  // Instantiate wallet for the rollup accounts
  const wallet = createWallet();
  
  // Main advance request handler
  app.addAdvanceHandler(async ({metadata, payload}) => {
    try {
        console.log("Advance Request");
        const sender = getAddress(metadata.msg_sender);
  
        // ether deposit handling
        if (sender === ether_portal_address) {
            console.log("Ether deposit request");
            try {
              // Use the wallet's handler to process the deposit
              await wallet.handler({ metadata, payload });
              console.log("Wallet after deposit: ", wallet.getWallet(getAddress(slice(payload, 0, 20))))
            } catch (error) {
                console.log("Error in eth deposit", error);
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
            console.debug("input data is", input_data);
            var etherDepositExecJSON = JSON.parse(hexToString(input_data[2]));
  
            if (etherDepositExecJSON.action === "jam.mint" && nft_erc1155_address) {
                console.log(
                    "Processing mint request for jam : #",
                    etherDepositExecJSON.jamID,
                );
                const jamToMint = Jam.getJamByID(etherDepositExecJSON.jamID);
                console.log("Jam fetched: ", jamToMint);
                if (jamToMint === null) {
                    app.createReport({
                        payload: stringToHex("Jam not found with given ID"),
                    });
                    return "accept";
                }
                const minterEthBalance = wallet.etherBalanceOf(input_data[0]);
                const jamMintPrice = parseEther(String(jamToMint.mintPrice));
                console.log("Eth balance : ", minterEthBalance);
                console.log("Mint Price : ", jamToMint.mintPrice);
  
                if (minterEthBalance >= jamMintPrice) {
                    console.log("Eth balance is sufficient to mint.");
                     const callData = encodeFunctionData({
                        abi: nftContractAbi,
                        functionName: "mint",
                        args: [input_data[0], etherDepositExecJSON.jamID],
                    });
                    app.createVoucher({
                        destination: nft_erc1155_address,
                        payload: callData,
                    });
                    Jam.updateCreatorsBalance(
                        etherDepositExecJSON.jamID,
                        input_data[0],
                        wallet,
                    );
                    jamToMint.handleMintStats(jamMintPrice); 
                } else {
                    console.log("Insufficient balance to mint. Deposit ether.");
                    app.createReport({
                        payload: stringToHex(
                            "Insufficient balance to mint. Deposit ether.",
                        ),
                    });
                }
  
                return "accept";
            }
        }
  
        // Relay dApp address
        if (sender === dapp_address_relay_contract) {
            console.log("Dapp Address relay request");
            try {
                await wallet.handler({ metadata, payload });
            } catch (error) {
                console.log("Error in relaying dapp address", error);
                return "reject";
            }
            return "accept";
        }
  
        // Jam Action handling
        var input = hexToString(payload);
        console.log("Payload : ", input);
        input = JSON.parse(input);
  
        switch (input.action) {
            case "jam.setNFTAddress":
                nft_erc1155_address = getAddress(input.address);
                console.log("NFT Contract address set as: ", nft_erc1155_address);
                break;
            case "jam.create":
                const newJam = new Jam(
                    input.name,
                    input.description,
                    input.mintPrice,
                    input.maxEntries,
                    input.genesisEntry,
                    sender,
                );
                console.log("New Jam created: ", newJam);
                break;
            case "jam.append":
                try {
                    const jam = Jam.getJamByID(input.jamID);
                    if (!jam) {
                        throw new Error(`Jam with ID ${input.jamID} not found.`);
                    }
                    
                    Jam.appendToJamByID(input.jamID, sender, input.entry);
                    console.log("Appended to JamID: ", input.jamID);
                    
                } catch (error) {
                    console.error("Error in jam.append:", error);
                    app.createReport({ payload: stringToHex(`Error: ${error.message}`) });
                    return "reject";
                }
                break;
            case "eth.withdraw":
                console.log("Withdraw ether");
                const amountToWithdraw = parseEther(String(input.amount));
                const voucher = wallet.withdrawEther(sender, amountToWithdraw);
                await app.createVoucher(voucher);
                break;
            default:
                throw new Error("Invalid input action");
        }
  
        return "accept";
    } catch (error) {
        console.error("Error in advance handler:", error);
        app.createReport({ payload: stringToHex(`Error: ${error.message}`) });
        return "reject";
    }
  });
  
  app.addInspectHandler(async ({ payload }) => {
    try {
        console.log("Inspect Request");
        payload = hexToString(payload);
        console.log("Payload : ", payload);
        const payloadArr = payload.split("/");
  
        switch (payloadArr[0]) {
            case "alljams":
                const allJams = Jam.allJams;
                app.createReport({ payload: stringToHex(JSON.stringify(allJams)) });
                break;
            case "jams":
                const jamID = payloadArr[1];
                const jamByID = Jam.getJamByID(Number(jamID));
                app.createReport({ payload: stringToHex(JSON.stringify(jamByID)) });
                break;
            case "openjams":
                const openJams = Jam.getJamsByStatus("open");
                app.createReport({ payload: stringToHex(JSON.stringify(openJams)) });
                break;
            case "closedjams":
                const closedJams = Jam.getJamsByStatus("closed");
                app.createReport({ payload: stringToHex(JSON.stringify(closedJams)) });
                break;
            case "user":
                const userAddress = getAddress(payloadArr[1]);
                const creatorJams = Jam.getJamsByCreator(userAddress);
                const participantJams = Jam.getJamsByParticipant(userAddress);
                const userJams = {
                    creator: creatorJams,
                    participant: participantJams,
                };
                app.createReport({ payload: stringToHex(JSON.stringify(userJams)) });
                break;
            case "balance":
                const balanceUserAddress = getAddress(payloadArr[1]);
                const eth_balance = wallet.etherBalanceOf(balanceUserAddress);
                console.log("eth balance:", eth_balance);
                await app.createReport({ payload: stringToHex(String(eth_balance)) });
                break;
            case "jamstats":
                const allJamStats = Jam.getAllJamsStats();
                app.createReport({ payload: stringToHex(JSON.stringify(allJamStats)) });
                break;
            default:
                throw new Error("Invalid inspect action");
        }
  
        return "accept";
    } catch (error) {
        console.error("Error in inspect handler:", error);
        app.createReport({ payload: stringToHex(`Error: ${error.message}`) });
        return "reject";
    }
  });
  
  // Start the application
  app.start().catch((e) => {
    console.error(e);
    process.exit(1);
  });
  
  