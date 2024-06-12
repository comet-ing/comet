// XXX even though ethers is not used in the code below, it's very likely
// it will be used by any DApp, so we are already including it here
import { hexToString, stringToHex, getAddress, slice, encodeFunctionData, parseEther } from "viem";
import Jam from './JamManager.js';
import { createApp } from "@deroll/app";
import { createWallet } from "@deroll/wallet";
import nftContractAbi from "./SimpleERC1155ABI.json"

// Create the application
const app = createApp({
  url: process.env.ROLLUP_HTTP_SERVER_URL || "http://127.0.0.1:5004",
});

// Set smart contract addresses as per network
var ether_portal_address = getAddress("0xFfdbe43d4c855BF7e0f105c400A50857f53AB044") 
var dapp_address_relay_contract = getAddress("0xF5DE34d6BbC0446E2a45719E718efEbaaE179daE")
var nft_erc1155_address = ""
var dapp_treasury_address = "" 

// Instantiate wallet for the rollup accounts
const wallet = createWallet();

// Main advance request handler
app.addAdvanceHandler(async ({ metadata, payload }) => {
  const sender = getAddress(metadata.msg_sender)

  // ether deposit handling
  if (sender === ether_portal_address){
    console.log("Ether deposit request")
    try {
      await wallet.handler({ metadata, payload });
    } catch (error) {
      console.log("Error in eth deposit", error)
      return "reject"
    }
    let input_data = [] 
    input_data[0] = getAddress(slice(payload, 0, 20))
    input_data[1] = slice(payload, 20, 52)
    input_data[2] = slice(payload, 52)
    console.debug("input data is", input_data);   
    var etherDepositExecJSON = JSON.parse(hexToString(input_data[2]))

    if (etherDepositExecJSON.action === "jam.mint"){
      console.log("Processing mint request for jam : #", etherDepositExecJSON.jamID)
      const jamToMint = Jam.getJamByID(etherDepositExecJSON.jamID)
      console.log("Jam fetched: ", jamToMint)
      const minterEthBalance = wallet.etherBalanceOf(input_data[0])
      console.log("Eth balance : ", minterEthBalance)
      console.log("Mint Price : ", jamToMint.mintPrice)

      if (minterEthBalance >= parseEther(String(jamToMint.mintPrice))){
        console.log("Eth balance is sufficient to mint.")
        const callData = encodeFunctionData({
          abi: nftContractAbi,
          functionName: "mint",
          args:[input_data[0], etherDepositExecJSON.jamID]
        })
        app.createVoucher({destination: nft_erc1155_address, payload: callData})
        Jam.updateCreatorsBalance(etherDepositExecJSON.jamID, input_data[0], wallet)
      }
      else {
        console.log("Insufficient balance to mint. Deposit ether.")
      }

      return "accept" 
      }
    }

  // Relay dApp address
  if (sender === dapp_address_relay_contract){
    console.log("Dapp Address relay request")
    try {
      await wallet.handler({ metadata, payload });
    } catch (error) {
      console.log("Error in relaying dapp address", error)
      return "reject"
    }
    return "accept"
  }

  // Jam Action handling
  var input = hexToString(payload)
  console.log("Advance payload : ", input)
  input = JSON.parse(input)

  if (input.action === "jam.setNFTAddress"){
    // TODO - set nft address
    nft_erc1155_address = getAddress(input.address)
    console.log("NFT Contract address set as: ", nft_erc1155_address)
  }
  else if (input.action === "jam.create"){
    const newJam = new Jam(input.name, input.description, input.mintPrice, input.maxEntries, input.genesisEntry, sender)
    Jam.showAllJams();
  }
  else if (input.action === "jam.append"){
    Jam.appendToJamByID(input.jamID, sender, input.entry)
  }
  
  return "accept";
});

app.addInspectHandler(async ({ payload }) => {
  //console.log("Received inspect request data " + JSON.stringify(data));
  payload = hexToString(payload);
  console.log("Inspect payload : ", payload);
  const payloadArr = payload.split("/");

  if (payloadArr[0] === "alljams") {
    const allJams = Jam.allJams
    app.createReport({ payload: stringToHex(JSON.stringify(allJams)) })
  }

  if (payloadArr[0] === "jams") {
    const jamID = payloadArr[1]
    const jamByID = Jam.getJamByID(Number(jamID))
    app.createReport({ payload: stringToHex(JSON.stringify(jamByID)) })
  }

  if (payloadArr[0] === "openjams") {
    const openJams = Jam.getJamsByStatus('open')
    app.createReport({ payload: stringToHex(JSON.stringify(openJams)) })
  }

  if (payloadArr[0] === "closedjams") {
    const closedJams = Jam.getJamsByStatus('closed')
    app.createReport({ payload: stringToHex(JSON.stringify(closedJams)) })
  }

  if (payloadArr[0] === "user") {
    const userAddress = getAddress(payloadArr[1])
    const creatorJams = Jam.getJamsByCreator(userAddress)
    const participantJams = Jam.getJamsByParticipant(userAddress)
    const userJams = {
      creator: creatorJams,
      participant: participantJams
    };
    app.createReport({ payload: stringToHex(JSON.stringify(userJams)) })
  }

  if (payloadArr[0] === "balance") {
    const userAddress = getAddress(payloadArr[1])
    const eth_balance = wallet.etherBalanceOf(userAddress)
    console.log("eth balance:", eth_balance)
    await app.createReport({ payload: stringToHex(String(eth_balance)) });
  }

  return "accept";
})

// Start the application
app.start().catch((e) => {
  console.error(e);
  process.exit(1);
});
