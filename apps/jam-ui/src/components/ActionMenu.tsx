"use client";
import {
    ActionIcon,
    Divider,
    Popover,
    Stack,
    useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { TbGridDots } from "react-icons/tb";
import { useAccount } from "wagmi";
import { EthBalance } from "./balance/EthBalance";

export const ActionMenu = () => {
    const [isOpen, { toggle }] = useDisclosure(false);
    const { isConnected } = useAccount();
    const theme = useMantineTheme();

    return (
        <Popover
            trapFocus
            withArrow
            shadow="md"
            withinPortal={false}
            opened={isOpen}
            closeOnClickOutside={false}
        >
            <Popover.Target>
                <ActionIcon
                    variant="filled"
                    radius="lg"
                    size="lg"
                    onClick={toggle}
                >
                    <TbGridDots size={theme.other.chainIconSize} />
                </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
                <Stack justify="center" pt="xs">
                    <ConnectButton />
                    {isConnected && <Divider />}

                    {isConnected && <EthBalance />}
                </Stack>
            </Popover.Dropdown>
        </Popover>
    );
};
