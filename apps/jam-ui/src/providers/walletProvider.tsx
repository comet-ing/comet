"use client";
import { CartesiProvider } from "@cartesi/wagmi";
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
import {
    coinbaseWallet,
    metaMaskWallet,
    trustWallet,
    walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Image from "next/image";
import { ReactNode } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { createConfig, http, WagmiProvider } from "wagmi";
import { baseSepolia } from "viem/chains";
import { cannon, foundry, sepolia } from "wagmi/chains";

// select chain based on env var (prod: Base Sepolia 84532, dev: foundry/sepolia/cannon)
const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "13370");
const nodeRpcUrl = process.env.NEXT_PUBLIC_NODE_RPC_URL;
const chain =
    [foundry, sepolia, cannon, baseSepolia].find((c) => c.id == chainId) ||
    foundry;

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

coinbaseWallet.preference = "smartWalletOnly";

const connectors = connectorsForWallets(
    [
        {
            groupName: "Recommended",
            wallets: [coinbaseWallet],
        },
        {
            groupName: "Popular",
            wallets: [metaMaskWallet, walletConnectWallet],
        },
        {
            groupName: "Other",
            wallets: [trustWallet],
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
const [defaultSepoliaRpcUrl] = sepolia.rpcUrls.default.http;
const [defaultCannonRpcUrl] = cannon.rpcUrls.default.http;
const [defaultBaseSepoliaRpcUrl] = baseSepolia.rpcUrls.default.http;

const buildTransport = (defaultRpcUrl: string, nodeRpcUrl?: string) =>
    nodeRpcUrl ? http(nodeRpcUrl) : http(defaultRpcUrl);

const rollupsRpcUrl = process.env.NEXT_PUBLIC_ROLLUPS_ENDPOINT
    ? `${process.env.NEXT_PUBLIC_ROLLUPS_ENDPOINT.replace(/\/$/, "")}/rpc`
    : "http://127.0.0.1:6751/rpc";

const wagmiConfig = createConfig({
    ssr: true,
    connectors,
    chains: [chain],
    multiInjectedProviderDiscovery: false,
    transports: {
        [foundry.id]: buildTransport(defaultFoundryRpcUrl, nodeRpcUrl),
        [sepolia.id]: buildTransport(defaultSepoliaRpcUrl, nodeRpcUrl),
        [cannon.id]: buildTransport(defaultCannonRpcUrl, nodeRpcUrl),
        [baseSepolia.id]: buildTransport(defaultBaseSepoliaRpcUrl, nodeRpcUrl),
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
                <CartesiProvider rpcUrl={rollupsRpcUrl}>
                    <RainbowKitProvider
                        appInfo={appInfo}
                        theme={walletTheme}
                        avatar={CustomAvatar}
                    >
                        {children}
                    </RainbowKitProvider>
                </CartesiProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};

export default WalletProvider;
