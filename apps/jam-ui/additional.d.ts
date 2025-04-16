declare namespace NodeJS {
    export interface ProcessEnv {
        /**
         * Network chain id
         */
        NEXT_PUBLIC_CHAIN_ID: string;
        /**
         * A full node RPC URL e.g. http://localhost:8080/anvil or https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}
         */
        NEXT_PUBLIC_NODE_RPC_URL: string;
        /**
         * Rollups backend endpoint
         */
        NEXT_PUBLIC_ROLLUPS_ENDPOINT: string;

        /**
         * Contract address of the application on chain
         */
        NEXT_PUBLIC_APP_ADDRESS: string;

        /**
         * Contract address of the ERC1155 contract used on chain
         */
        NEXT_PUBLIC_ERC1155_ADDRESS: string;

        /**
         * Contract address of the inputbox contract
         */
        INPUTBOX_CONTRACT_ADDRESS: string;

        /**
         * Host/domain of the web application to be used when interacting with
         * Warpcast frames
         */
        WEB_APP_BASE_URL: string;

        /**
         * Neynar service API KIT
         */
        NEYNAR_ONCHAIN_KIT_API_KEY: string;
    }
}
