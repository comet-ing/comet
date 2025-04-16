import CartesiAppContract from "@cartesi/rollups/out/Application.sol/Application.json" with { type: "json" };
import OutputsContract from '@cartesi/rollups/out/Outputs.sol/Outputs.json' with { type: "json" };
import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import { Abi, Address } from "viem";
import EtherPortalDeployment from './deployments/EtherPortal.json' with { type: "json" };

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
