## Getting Started

First, follow the [README steps from the backend](../jam-backend/README.md). Once you did the steps and got the backend up-and-running you should have the **application address and ERC-1155 contract address** at hand.

> [!IMPORTANT]  
> Required to succeed
>
> - @cartesi/cli@2.0.0-alpha.9
> - NodeJS 20+
> - yarn

## Starting the App

1. Install the dependencies

```bash
yarn install
```

2. Ensure the Cartesi node is running (e.g. `cartesi run`). The app uses [@cartesi/wagmi](https://cartesi.github.io/rollups-ts/wagmi) and [@cartesi/viem](https://cartesi.github.io/rollups-ts/) for L2 data: the collections page loads vouchers via `useOutputs` (JSON-RPC `cartesi_listOutputs`).

3. Create a .env file inside the `/jam-ui` folder. You can copy the .env.template and modify the values as necessary.

4. Run the UI in Development mode.

```bash
yarn dev

```

5. You should be able to access the UI on `http://localhost:3000`
