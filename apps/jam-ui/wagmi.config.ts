import hardhatDeploy from "@sunodo/wagmi-plugin-hardhat-deploy";
import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import { Abi } from "viem";
import OutputsContract from '../../node_modules/@cartesi/rollups/export/artifacts/contracts/common/Outputs.sol/Outputs.json' with { type: "json" };
import CartesiAppContract from "../../node_modules/@cartesi/rollups/export/artifacts/contracts/dapp/Application.sol/Application.json" with { type: "json" };

export default defineConfig({
    out: "src/generated/wagmi-rollups/index.ts",
    contracts: [
        {
            name: "CartesiDApp",
            abi: CartesiAppContract.abi as Abi,
        },
        {
            name: "OutputsFactory",
            abi: OutputsContract.abi as Abi
        }
    ],
    plugins: [
        hardhatDeploy({
            directory: "../../node_modules/@cartesi/rollups/export/abi",
        }),
        react(),
    ],
});
