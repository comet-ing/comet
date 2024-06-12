declare namespace NodeJS {
    export interface ProcessEnv {
        /**
         * Network chain id
         */
        NEXT_PUBLIC_CHAIN_ID: string;
        /**
         * Alchemy API key to have an extra rpc-node to work in conjunction with public nodes.
         */
        NEXT_PUBLIC_ALCHEMY_API_KEY: string;
        /**
         * Rollups backend endpoint
         */
        NEXT_PUBLIC_ROLLUPS_ENDPOINT: string;

        /**
         * Contract address of the application on chain
         */
        NEXT_PUBLIC_APP_ADDRESS: string;
    }
}
