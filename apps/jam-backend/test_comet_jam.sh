#!/bin/bash

# Set common variables
INPUT_BOX_ADDRESS="0x593E5BCf894D6829Dd26D0810DA7F064406aebB6"
APPLICATION_ADDRESS="0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e"
MNEMONIC="test test test test test test test test test test test junk"
RPC_URL="http://localhost:8545/"

# Function to send input using cast
send_input() {
    local input=$1
    local index=$2
    cast send \
        --mnemonic "$MNEMONIC" \
        --mnemonic-index $index \
        --rpc-url "$RPC_URL" \
        $INPUT_BOX_ADDRESS \
        "addInput(address,bytes)(bytes32)" $APPLICATION_ADDRESS $input
}

echo "Testing Comet Jam functions..."

# 1. Create a new Comet Jam
echo "1. Creating a new Comet Jam..."
CREATE_INPUT="7b22616374696f6e223a20226a616d2e637265617465222c226e616d65223a20226d794a616d222c20226465736372697074696f6e22203a20226d79206a616d2064657363222c20226d696e745072696365223a202233222c20226d6178456e7472696573223a20332c202267656e65736973456e747279223a2022526f7365732061726520726564227d"
send_input $CREATE_INPUT 0

# 2. Append to the Comet Jam three times (using different accounts)
echo "2. Appending to the Comet Jam (1/3)..."
APPEND_INPUT_1="7b22616374696f6e223a20226a616d2e617070656e64222c20226a616d4944223a20302c2022656e74727922203a2022536b6965732061726520626c7565227d"
send_input $APPEND_INPUT_1 1

echo "   Appending to the Comet Jam (2/3)..."
APPEND_INPUT_2="7b22616374696f6e223a20226a616d2e617070656e64222c20226a616d4944223a20302c2022656e74727922203a2022566f696c657473206172652070757270656c227d"
send_input $APPEND_INPUT_2 2

echo "   Appending to the Comet Jam (3/3)..."
APPEND_INPUT_3="7b22616374696f6e223a20226a616d2e617070656e64222c20226a616d4944223a20302c2022656e74727922203a2022566f696c657473206172652070757270656c227d"
send_input $APPEND_INPUT_3 3

# 3. Simple Ether deposit to the dApp
echo "3. Performing simple Ether deposit to the dApp..."
cast send \
    --mnemonic "$MNEMONIC" \
    --mnemonic-index 0 \
    --rpc-url "$RPC_URL" \
    0xfa2292f6D85ea4e629B156A4f99219e30D12EE17 \
    "depositEther(address,bytes)" \
    $APPLICATION_ADDRESS \
    0x \
    --value 2ether

# Set NFT address
echo "Setting NFT address..."
NFT_ADDRESS_INPUT="7b22616374696f6e223a226a616d2e7365744e465441646472657373222c202261646472657373223a22307837313235313665363143384233383364463441363343466538336437373031426365353442303365227d"
send_input $NFT_ADDRESS_INPUT 0

# 4. Ether Deposit to Mint a Comet
echo "4. Performing Ether deposit to mint a Comet..."
cast send \
    --mnemonic "$MNEMONIC" \
    --mnemonic-index 3 \
    --rpc-url "$RPC_URL" \
    0xfa2292f6D85ea4e629B156A4f99219e30D12EE17 \
    "depositEther(address,bytes)" \
    $APPLICATION_ADDRESS \
    0x7b22616374696f6e223a226a616d2e6d696e74222c20226a616d4944223a307d \
    --value 3ether

echo "Test script completed."
