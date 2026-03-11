// Use dist path for compatibility with tsconfig moduleResolution when "exports" subpath is not resolved
import { applicationAbi, outputsAbi } from "@cartesi/viem/dist/rollups.js";
import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import { Abi, Address } from "viem";
import EtherPortalDeployment from './deployments/EtherPortal.json' with { type: "json" };

export default defineConfig({
    out: "src/generated/wagmi-rollups/index.ts",
    contracts: [
        {
            name: "CartesiDApp",
            abi: applicationAbi as Abi,
        },
        {
            name: "OutputsFactory",
            abi: outputsAbi as Abi,
        },
        {
            name: EtherPortalDeployment.contractName,
            abi: EtherPortalDeployment.abi as Abi,
            address: EtherPortalDeployment.address as Address
        }
    ],
    plugins: [        
        react(),
    ],
});
