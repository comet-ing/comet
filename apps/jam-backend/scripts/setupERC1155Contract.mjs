/* eslint-disable turbo/no-undeclared-env-vars */
import { inputBoxConfig } from "@cartesi/viem/abi";
import chalk from "chalk";
import { join, resolve } from "node:path";
import shelljs from "shelljs";
import {
    createPublicClient,
    createWalletClient,
    http,
    stringToHex,
    zeroAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { anvil, sepolia } from "viem/chains";
import { writeDeploymentInfo } from "./utils.mjs";

const DEVNET_DEFAULT_PK =
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const currentDir = import.meta.dirname;
const PRIVATE_KEY = process.env.PRIVATE_KEY ?? DEVNET_DEFAULT_PK;
const CHAIN_ID = process.env.CHAIN_ID ?? "31337";
const RPC_URL = process.env.PROVIDER_RPC_URL ?? "http://127.0.0.1:8080/anvil";
const APP_ADDRESS = process.env.APP_ADDRESS ?? zeroAddress;

const chains = [sepolia, anvil];
const chain = chains.find((chain) => chain.id === parseInt(CHAIN_ID)) ?? anvil;
const config = { chain, transport: http(RPC_URL) };
const publicClient = createPublicClient(config);
const walletClient = createWalletClient(config);
const mainAccount = privateKeyToAccount(PRIVATE_KEY);
const log = console.log;
const logError = console.error;

log(chalk.green(`\n\Starting setup with the following information:`));
log(
    chalk.cyan(
        `\nChain-id (${chain.id})\nrpc-url (${RPC_URL})\nDeployer address (${mainAccount.address})`,
    ),
);

const stringify = (value, space) =>
    JSON.stringify(
        value,
        (_key, value) => {
            return typeof value === "bigint" ? value.toString() : value;
        },
        space ?? 2,
    );

async function setNFTAddress({ contractAddress }) {
    const payload = stringToHex(
        JSON.stringify({
            action: "jam.setNFTAddress",
            address: contractAddress,
        }),
    );

    const { request } = await publicClient.simulateContract({
        account: mainAccount,
        abi: inputBoxConfig.abi,
        address: inputBoxConfig.address,
        functionName: "addInput",
        args: [APP_ADDRESS, payload],
    });

    const txHash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
    });

    log(chalk.green(`\nTransaction Receipt`));
    log(chalk.cyan(`\n${stringify(receipt)}`));

    log(
        chalk.green(
            `\n\nDeployed ERC1155 contract address: ${contractAddress}`,
        ),
    );

    return true;
}

async function deployJamContract() {
    const contractsPath = resolve(currentDir, "../contracts");
    const srcFolder = join(contractsPath, "src");
    const contract = `${srcFolder}/JamContract.sol:JamContract`;

    log(chalk.yellow(`Creating JamContract on ${RPC_URL}`));

    const result = shelljs.exec(
        `forge create --broadcast --rpc-url ${RPC_URL} --chain-id ${CHAIN_ID} --private-key ${PRIVATE_KEY} ${contract} --json`,
    );

    if (result.code === 0) {
        try {
            const deployment = JSON.parse(result.stdout);

            await writeDeploymentInfo({
                filename: `JamContract-${CHAIN_ID}-${deployment.transactionHash}.json`,
                outFolder: join(contractsPath, "deployments"),
                content: stringify({ deployment, chainId: CHAIN_ID }),
            });

            return {
                owner: deployment.deployer,
                contractAddress: deployment.deployedTo,
                txHash: deployment.transactionHash,
            };
        } catch (error) {
            logError(
                chalk.red(
                    `Problem trying to parse the deployment return: ${result.stderr}`,
                ),
            );

            throw error;
        }
    } else {
        logError(chalk.red(result.stderr));
        process.exit(1);
    }
}

deployJamContract()
    .then(setNFTAddress)
    .catch((err) => {
        logError(err);
        process.exit(1);
    })
    .finally(() => {
        log(chalk.cyan(`\n✅ Setup completed!`));
        process.exit(0);
    });
