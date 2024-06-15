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

// Instantiate wallet for the rollup accounts
const wallet = createWallet();

// Main advance request handler
app.addAdvanceHandler(async ({ metadata, payload }) => {
  console.log("Advance Request")
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

    if (payload.length > 53*2) {
      // ether deposit with execution payload
      input_data[2] = slice(payload, 52);
    } else {
      // ether deposit without execution payload
      return "accept"
    }
    console.debug("input data is", input_data);   
    var etherDepositExecJSON = JSON.parse(hexToString(input_data[2]))

    if (etherDepositExecJSON.action === "jam.mint" && nft_erc1155_address){
      console.log("Processing mint request for jam : #", etherDepositExecJSON.jamID)
      const jamToMint = Jam.getJamByID(etherDepositExecJSON.jamID)
      console.log("Jam fetched: ", jamToMint)
      if (jamToMint === null){
        app.createReport({ payload: stringToHex("Jam not found with given ID") })
        return "accept"
      }
      const minterEthBalance = wallet.etherBalanceOf(input_data[0])
      const jamMintPrice = parseEther(String(jamToMint.mintPrice))
      console.log("Eth balance : ", minterEthBalance)
      console.log("Mint Price : ", jamToMint.mintPrice)

      if (minterEthBalance >= jamMintPrice){
        console.log("Eth balance is sufficient to mint.")
        const callData = encodeFunctionData({
          abi: nftContractAbi,
          functionName: "mint",
          args:[input_data[0], etherDepositExecJSON.jamID]
        })
        app.createVoucher({destination: nft_erc1155_address, payload: callData})
        Jam.updateCreatorsBalance(etherDepositExecJSON.jamID, input_data[0], wallet)
        jamToMint.handleMintStats(jamMintPrice)
      }
      else {
        console.log("Insufficient balance to mint. Deposit ether.")
        app.createReport({ payload: stringToHex("Insufficient balance to mint. Deposit ether.") })
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
  console.log("Payload : ", input)
  input = JSON.parse(input)

  if (input.action === "jam.setNFTAddress"){
    nft_erc1155_address = getAddress(input.address)
    console.log("NFT Contract address set as: ", nft_erc1155_address)
  }
  else if (input.action === "jam.create"){
    const newJam = new Jam(input.name, input.description, input.mintPrice, input.maxEntries, input.genesisEntry, sender)
    console.log("New Jam created: ", newJam)
  }
  else if (input.action === "jam.append"){
    Jam.appendToJamByID(input.jamID, sender, input.entry)
    console.log("Appended to JamID: ", input.jamID)
  }
  else if (input.action === "eth.withdraw"){
    console.log("Withdraw ether")
    const amountToWithdraw = BigInt(input.amount)
    try {
      const voucher = wallet.withdrawEther(sender, amountToWithdraw)
      await app.createVoucher(voucher)
    } catch(error){
      console.log("Error while withdrawing ether: ", error)
    }
  }
  else{
    console.log("Invalid input action.")
    app.createReport({ payload: stringToHex("Invalid input action") })
    return "reject"
  }
  
  return "accept";
});

app.addInspectHandler(async ({ payload }) => {
  console.log("Inspect Request")
  payload = hexToString(payload);
  console.log("Payload : ", payload);
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

  if (payloadArr[0] === "jamstats") {
    const allJamStats = Jam.getAllJamsStats()
    app.createReport({ payload: stringToHex(JSON.stringify(allJamStats)) })
  }

  return "accept";
})

// Start the application
app.start().catch((e) => {
  console.error(e);
  process.exit(1);
});
