#!/bin/bash

# Configuration
ROLLUP_HOST="http://localhost:8080"
DAPP_ADDRESS="0xab7528bb862fB57E8A2BCd567a2e929a0Be56a5e"
ITERATIONS=5  # Number of times each browser will run through all endpoints
NUM_BROWSERS=4  # Number of simulated browsers

# Function to decode hex string
hex_to_string() {
    local hex=$1
    hex=${hex#"0x"}
    echo -n "$hex" | xxd -r -p
}

# Function to make a single request
make_request() {
    local payload=$1
    local browser_id=$2
    local url="${ROLLUP_HOST}/inspect/${DAPP_ADDRESS}/${payload}"
    
    echo "$(date '+%H:%M:%S') - Browser $browser_id - Making request: $url"
    
    response=$(curl -s "$url" \
        -H "Accept: application/json, text/plain, */*" \
        -H "Accept-Language: en-US,en;q=0.9" \
        -H "Connection: keep-alive")
    
    if [ $? -eq 0 ]; then
        echo "Browser $browser_id - Raw Response:"
        echo "$response" | jq .
        
        # Extract and decode the payload
        payload=$(echo "$response" | jq -r '.reports[0].payload')
        if [ "$payload" != "null" ] && [ "$payload" != "" ]; then
            echo "Browser $browser_id - Decoded Response:"
            decoded=$(hex_to_string "$payload")
            echo "$decoded" | jq . || echo "$decoded"
        fi
        echo "----------------------------------------"
    else
        echo "Browser $browser_id - Request failed"
        echo "$response"
        echo "----------------------------------------"
    fi
}

# Array of test payloads
declare -a payloads=(
    "alljams"
    "jams/0"
    "openjams"
    "closedjams"
    "user/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    "balance/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    "jamstats"
)

echo "Starting stress test with $NUM_BROWSERS browsers, $ITERATIONS iterations each"
echo "Using API endpoint: $ROLLUP_HOST"
echo "DApp Address: $DAPP_ADDRESS"
echo "----------------------------------------"

# Track start time
start_time=$(date +%s)

# Main test loop
for browser in $(seq 1 $NUM_BROWSERS); do
    for iteration in $(seq 1 $ITERATIONS); do
        echo "Browser $browser - Starting iteration $iteration"
        
        for payload in "${payloads[@]}"; do
            make_request "$payload" "$browser"
            # Random sleep between 0.5 and 2 seconds
            sleep "0.$(( RANDOM % 15 + 5 ))"
        done
        
        echo "Browser $browser - Completed iteration $iteration"
        echo "=============================================="
    done
done

# Calculate and display test duration
end_time=$(date +%s)
duration=$((end_time - start_time))

# Print summary
echo "Stress test completed!"
echo "Total duration: $duration seconds"
echo "Total requests: $((${#payloads[@]} * NUM_BROWSERS * ITERATIONS))"
echo "Average request rate: $(bc <<< "scale=2; ${#payloads[@]} * $NUM_BROWSERS * $ITERATIONS / $duration") requests/second"