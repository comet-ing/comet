# JAM-BACKEND

This is backend for JAM Cartesi dApp written in JavaScript. It uses node to execute the backend application.
The application entrypoint is the `src/index.js` file. It is bundled with [esbuild](https://esbuild.github.io), but any bundler can be used.

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
cartesi run --epoch-period=10
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

### Inpect eth balance inside the dapp
```
http://localhost:8080/inspect/balance/0x70997970C51812dc3A010C7d01b50e0d17dc79C8
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
```