import hardhatDeploy from "@sunodo/wagmi-plugin-hardhat-deploy";
import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";

export default defineConfig({
    out: "src/generated/wagmi-rollups/index.ts",
    plugins: [
        hardhatDeploy({
            directory: "../../node_modules/@cartesi/rollups/export/abi",
        }),
        react(),
    ],
});
