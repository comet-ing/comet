import { applicationAbi, outputsAbi } from "@cartesi/viem/abi";
import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import { Abi, Address } from "viem";
import EtherPortalDeployment from './deployments/EtherPortal.json' with { type: "json" };

export default defineConfig({
    out: "src/generated/wagmi-rollups/index.ts",
    contracts: [
        {
            name: "CartesiApplication",
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
