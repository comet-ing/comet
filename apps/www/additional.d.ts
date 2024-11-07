declare namespace NodeJS {
    export interface ProcessEnv {
        /**
         * Domain where the Comet app is deployed e.g. http://localhost:3000
         */
        NEXT_PUBLIC_COMET_APP_DOMAIN: string;

        /**
         * Domain where a plausible instance is deployed e.g. http://localhost:4000
         */
        NEXT_PUBLIC_PLAUSIBLE_DOMAIN: string;

        /**
         * The application domain to be sent to a plausible instance.
         */
        NEXT_PUBLIC_WWW_DOMAIN: string;
    }
}
