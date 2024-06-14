import hardhatDeploy from "@sunodo/wagmi-plugin-hardhat-deploy";
import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import { Abi } from "viem";
import CartesiDAppContract from "../../node_modules/@cartesi/rollups/export/artifacts/contracts/dapp/CartesiDApp.sol/CartesiDApp.json" with { type: "json" };

export default defineConfig({
    out: "src/generated/wagmi-rollups/index.ts",
    contracts: [
        {
            name: "CartesiDApp",
            abi: CartesiDAppContract.abi as Abi,
        },
    ],
    plugins: [
        hardhatDeploy({
            directory: "../../node_modules/@cartesi/rollups/export/abi",
        }),
        react(),
    ],
});
