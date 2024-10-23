# JAM-BACKEND

This is backend for Comet dApp powered by Cartesi written in JavaScript. It uses node to execute the backend application.
The application entrypoint is the `src/index.js` file. It is bundled with [esbuild](https://esbuild.github.io), but any bundler can be used.

## Steps to run with Nonodo + Cartesi Machine

>**NOTE:** This backend works with Rollups v2. It will require an [unreleased Deroll library](https://github.com/tuler/deroll/tree/feature/v2) version. You'll need to clone the repo, build release/v2 branch and `pnpm link path-to-deroll-release-v2` here in this project. Both app and wallet package needs to be linked separately.
1. Install brunodo(nonodo variant) for Espresso ready integration. Note that this was tested with `brunodo 2.10.1-beta` for arm64 darwin
```
npm i -g brunodo
```
2. Run brunodo node
```
brunodo
```
This will spin up a local instance of Espresso and Cartesi node ready to recieve user inputs.

3. Build your comet jam-backend with cartesi cli
```
cartesi build
```
4. Download your platform specific Cartesi-Machine from [here](https://github.com/edubart/cartesi-machine-everywhere/releases/tag/v0.18.1-rc7). 
5. In another terminal tab, cd into `./bin` of above downloaded folder and run Comet backend inside the Cartesi Machine
```
$ ./cartesi-machine --network \
--env=ROLLUP_HTTP_SERVER_URL=http://10.0.2.2:5004 \ --flash-drive=label:root,filename:./path-to-jam-backend-folder/.cartesi/image.ext2 \ --volume=.:/mnt \
--workdir=mnt/jam-backend \
--ram-length=256Mi \
-- yarn start 
``` 
You should now have your comet backend up and running. Follow [this](https://docs.google.com/document/d/1x8IhhDeZR818uBHXk-NQvZETXhFXbGDj0OLG2h3e9EE/edit?usp=sharing) detailed guide in case of issues. 

6. Send inputs to the backend via L1 InputBox contract: You can run the test script `test_comet_jam.sh` file to test basic functions. Alternatively, open another terminal tab and use `cast` commands listed below to test the app:

**Create a new Comet Jam**
```
INPUT=7b22616374696f6e223a20226a616d2e637265617465222c226e616d65223a20226d794a616d222c20226465736372697074696f6e22203a20226d79206a616d2064657363222c20226d696e745072696365223a202233222c20226d6178456e7472696573223a20332c202267656e65736973456e747279223a2022526f7365732061726520726564227d; \
INPUT_BOX_ADDRESS=0x593E5BCf894D6829Dd26D0810DA7F064406aebB6; \ 
APPLICATION_ADDRESS=0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e; \
cast send \
  --mnemonic "test test test test test test test test test test test junk" \
  --rpc-url "http://localhost:8545/" \
  $INPUT_BOX_ADDRESS \
  "addInput(address,bytes)(bytes32)" $APPLICATION_ADDRESS $INPUT
```

**Append to the Comet Jam**
```
INPUT=7b22616374696f6e223a20226a616d2e617070656e64222c20226a616d4944223a20302c2022656e74727922203a2022536b6965732061726520626c7565227d; \
INPUT_BOX_ADDRESS=0x593E5BCf894D6829Dd26D0810DA7F064406aebB6; \ 
APPLICATION_ADDRESS=0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e; \
cast send \
  --mnemonic "test test test test test test test test test test test junk" \
  --rpc-url "http://localhost:8545/" \
  $INPUT_BOX_ADDRESS \
  "addInput(address,bytes)(bytes32)" $APPLICATION_ADDRESS $INPUT
```

**Simple Ether deposit to the dApp**
```
cast send \                                           
  --mnemonic "test test test test test test test test test test test junk" \
  --rpc-url "http://localhost:8545/" \
  0xfa2292f6D85ea4e629B156A4f99219e30D12EE17 \
  "depositEther(address,bytes)" \
  0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e \
  0x \
  --value 2ether
```

**Ether Deposit to Mint a Comet**
```
cast send \                                           
  --mnemonic "test test test test test test test test test test test junk" \
  --rpc-url "http://localhost:8545/" \
  0x1733b13aAbcEcf3464157Bd7954Bd7e4Cf91Ce22 \
  "depositEther(address,bytes)" \
  0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e \
  0x7b22616374696f6e223a226a616d2e6d696e74222c20226a616d4944223a317d \
  --value 3ether
```


##  Steps to run the node locally
1. cd in project backend directory and install node packages
```
yarn && yarn install
```
2. Run cartesi build
```
cartesi build
```
3. Turn up the node
```
cartesi run --epoch-duration=10
```
4. Deploy ERC1155 smart contract - Open [Remix IDE](https://remix.ethereum.org/) and copy `contracts/SimpleERC1155.sol` file to Remix project. Compile, select environment as `Injected Provider - Metamask` and hit deploy. Copy the deployed contract address.

5. In a separate terminal tab, use `cartesi send generic` to set the address of the NFT contract deployed in step #4. The input JSON string to use below:
```
{"action":"jam.setNFTAddress", "address":"deployed-nft-contract-address"}
```
6. Use `cartesi send` to set the address of the dApp contract. Select Option available as `Send DApp address input to the application.`

7. Environment is now set, proceed for app inputs. Some input actions with json examples are given below.

### Creating a Jam
```
{"action": "jam.create","name": "myJam", "description" : "my jam desc", "mintPrice": "3", "maxEntries": 3, "genesisEntry": "Roses are red"}
```

### Append to a Jam
```
{"action": "jam.append", "jamID": 0, "entry" : "Skies are blue"}
```
### Create voucher to mint a Jam
Open Explorer to send this input. It's an EtherDeposit function with an arbitrary payload. Select dapp address, ether amount to mint the jam and provide hex encoded extra data. Example below string:
```
{"action":"jam.mint", "jamID":1}
```
Note: You'll have to convert the above JSON to hex format before submitting.

### Withdraw ether from the rollup application
Accepts ether amount in wei format 
```
{"action":"eth.withdraw", "amount":"2000000000000000000"}
```

### Inpect eth balance inside the dapp
```
http://localhost:8080/inspect/balance/<input-address-here>
```

### Other inpect calls for Jams info
```
// Get a jam by ID
http://localhost:8080/inspect/jams/<input-jamID-here>

// Get all open jams
http://localhost:8080/inspect/openjams

// Get all closed jams
http://localhost:8080/inspect/closedjams

// Get all jams
http://localhost:8080/inspect/jams

// Get jams by user address
http://localhost:8080/inspect/user/<input-address-here>

// Get all jam statistics
http://localhost:8080/inspect/jamstats
```