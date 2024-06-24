"use client";
import { useMantineColorScheme } from "@mantine/core";
import {
    AvatarComponent,
    connectorsForWallets,
    darkTheme,
    getDefaultWallets,
    lightTheme,
    RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { ThemeOptions } from "@rainbow-me/rainbowkit/dist/themes/baseTheme";
import "@rainbow-me/rainbowkit/styles.css";
import { ledgerWallet, trustWallet } from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Image from "next/image";
import { ReactNode } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { createConfig, fallback, http, WagmiProvider } from "wagmi";
import { base, baseSepolia, foundry } from "wagmi/chains";

// select chain based on env var
const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "31337");
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const chain =
    [foundry, base, baseSepolia].find((c) => c.id == chainId) || foundry;

const projectId = "37a6d6f11d78a12ca814a377a53b5b55";

const connectorsForWalletsParameters = {
    appName: "Cometing",
    projectId,
};

const { wallets } = getDefaultWallets(connectorsForWalletsParameters);

const appInfo = {
    appName: connectorsForWalletsParameters.appName,
    learnMoreUrl: "https://comet.ing",
};

const connectors = connectorsForWallets(
    [
        ...wallets,
        {
            groupName: "Other",
            wallets: [trustWallet, ledgerWallet],
        },
    ],
    connectorsForWalletsParameters,
);

const CustomAvatar: AvatarComponent = ({ address, ensImage, size }) => {
    return ensImage ? (
        <Image
            src={ensImage}
            width={size}
            height={size}
            style={{ borderRadius: 999 }}
            alt={address}
        />
    ) : (
        <Jazzicon diameter={size} seed={jsNumberForAddress(address)} />
    );
};

const [defaultFoundryRpcUrl] = foundry.rpcUrls.default.http;
const [defaultBaseSepoliaRpcUrl] = baseSepolia.rpcUrls.default.http;
const [defaultBaseRpcUrl] = base.rpcUrls.default.http;

const wagmiConfig = createConfig({
    ssr: true,
    connectors,
    chains: [chain],
    transports: {
        [foundry.id]: http(defaultFoundryRpcUrl),
        [base.id]: alchemyApiKey
            ? fallback([
                  http(
                      `https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
                  ),
                  http(defaultBaseRpcUrl),
              ])
            : http(defaultBaseRpcUrl),
        [baseSepolia.id]: alchemyApiKey
            ? fallback([
                  http(
                      `https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`,
                  ),
                  http(defaultBaseSepoliaRpcUrl),
              ])
            : http(defaultBaseSepoliaRpcUrl),
    },
});

const queryClient = new QueryClient();

const WalletProvider = ({ children }: { children: ReactNode }) => {
    const scheme = useMantineColorScheme();

    // XXX: make this match the mantine theme
    const themeOptionsLight: ThemeOptions = {
        accentColor: "rgb(71,52,171)",
        borderRadius: "small",
    };

    const themeOptionsDark: ThemeOptions = {
        accentColor: "rgb(97,77,196)",
        borderRadius: "small",
    };

    const walletTheme =
        scheme.colorScheme == "dark"
            ? darkTheme(themeOptionsDark)
            : lightTheme(themeOptionsLight);

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    appInfo={appInfo}
                    theme={walletTheme}
                    avatar={CustomAvatar}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};

export default WalletProvider;
