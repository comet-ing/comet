# JAM-BACKEND

This is backend for Comet dApp powered by Cartesi written in JavaScript. It uses node to execute the backend application.
The application entrypoint is the `src/index.js` file. It is bundled with [esbuild](https://esbuild.github.io), but any bundler can be used.

## Steps to run the node locally (Using Cartesi/cli for node-v2)

> [!IMPORTANT]  
> Required to succeed
>
> - @cartesi/cli@2.0.0-alpha.9 or above
> - Docker
> - Foundry [reference to install](https://book.getfoundry.sh/getting-started/installation)

1. cd in project backend directory and install node packages

```
yarn install
```

2. Start the rollups environment

```
cartesi rollups start
```

3. Run cartesi build

```
cartesi build
```

4. Deploy the DApp (for devnet the default options are fine)

```
cartesi rollups deploy
```

5. Check on the application address provided in the terminal by the previous step and fill the [.env.devnet](./env.devnet) file with the appropriate information.

6. Build the contract assets we use (ERC1155 contract).

```
yarn build:contracts
```

7. deploy the ERC1155 contract we use and notify the deployed DApp about it. (Check the docker logs in rollups-node)

```
yarn deploy:devnet:contract
```

7.1 You can use the address printed for ERC1155 as it is necessary to include the [UI](../jam-ui/) environment variables. In case you clean-up your screen a deployment information is saved under `contracts/deployments`.

8. The environment is now set, proceed for app inputs. Some input actions with json examples are given below for illustration purposes as they need to be encoded and sent through contracts.

You can use both the `./test_comet_jam.sh` and `test_inspect.sh` to automatically Create/Contribute/Mint a JAM. Also you can check the data by using making inspect calls to the node. Just update the **application address** inside the scripts in case it does not matches.

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

### Using a Rest Client API (e.g Thunder Client)

The http method should be `POST` and the the way to inspect is the path as body text content. The returns are always hex values, so probably you want to use the [UI](../jam-ui/)

The inspect format is as follow.

`http://127.0.0.1:8080/inspect/<application_address>`

// Get a jam by ID

```
jams/<input-jamID-here>
```

// Get all open jams

> body -> openjams

// Get all closed jams

> body -> closedjams

// Get all jams

> body -> jams

// Get jams by user address

> body -> user/<input-address-here>

// Get all jam statistics

> body -> jamstats
