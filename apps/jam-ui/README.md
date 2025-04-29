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

2. Make sure the graphql service is running. It is necessary if checking on vouchers in the collections page.

```bash
cartesi rollups start --services graphql
```

3. Create a .env file inside the `/jam-ui` folder. You can copy the .env.template and modify the values as necessary.

4. Run the UI in Development mode.

```bash
yarn dev

```

5. You should be able to access the UI on `http://localhost:3000`
