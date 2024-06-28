import { Box, Button, Group, Text, Transition } from "@mantine/core";
import { useCallback } from "react";
import { baseSepolia } from "viem/chains";
import { useAccount, useConfig, useConnect } from "wagmi";
import { CoinbaseWalletLogo } from "./CoinbaseWalletLogo";

export function CreateSmartWalletButton() {
    const config = useConfig();
    const { isConnected } = useAccount();
    const { connectors, connect } = useConnect();
    // we only use one chain per deploy;
    const chain = config.chains[0];

    const createWallet = useCallback(() => {
        const coinbaseWalletConnector = connectors.find(
            (connector) => connector.id === "coinbaseWalletSDK",
        );

        if (coinbaseWalletConnector) {
            connect({ connector: coinbaseWalletConnector });
        }
    }, [connectors, connect]);

    if (chain.id !== baseSepolia.id) {
        return "";
    }

    return (
        <Transition
            mounted={!isConnected}
            duration={400}
            timingFunction="ease"
            transition="slide-right"
        >
            {(styles) => (
                <Button
                    onClick={createWallet}
                    justify="flex-start"
                    w="auto"
                    style={styles}
                >
                    <Group p={0} gap="xs">
                        <Box
                            p={0}
                            component={() => <CoinbaseWalletLogo size={21} />}
                        />
                        <Text component="span" size="lg" fw="bold">
                            Create Wallet
                        </Text>
                    </Group>
                </Button>
            )}
        </Transition>
    );
}
