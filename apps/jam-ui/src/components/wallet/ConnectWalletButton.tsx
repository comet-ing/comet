import { Box, Button, Group, Text } from "@mantine/core";
import {
    ConnectButton,
    useChainModal,
    useConnectModal,
} from "@rainbow-me/rainbowkit";
import { FC } from "react";
import { FaNetworkWired, FaWallet } from "react-icons/fa6";
import { useAccount, useConfig } from "wagmi";

const btnProps = {
    fw: "bold",
};

export const ConnectWalletButton: FC<{ isMobile?: boolean }> = ({
    isMobile,
}) => {
    const config = useConfig();
    const { isConnected, chain } = useAccount();
    const { openConnectModal } = useConnectModal();
    const { openChainModal } = useChainModal();

    if (!isConnected) {
        return (
            <Button w="auto" justify="flex-start" onClick={openConnectModal}>
                <Group justify="center" align="center" gap="sm">
                    <Box p={0} component={() => <FaWallet size={21} />} />
                    <Text component="span" size="lg" fw="bold">
                        Connect
                    </Text>
                </Group>
            </Button>
        );
    }

    if (isConnected && !chain)
        return (
            <Button
                color="red"
                justify="flex-start"
                leftSection={<FaNetworkWired size="26" />}
                onClick={openChainModal}
            >
                <Text component="span" fw="bold" size="lg">
                    Wrong Network
                </Text>
            </Button>
        );

    return <ConnectButton accountStatus="full" showBalance />;
};
