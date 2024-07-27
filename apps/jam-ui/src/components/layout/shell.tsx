"use client";
import {
    Anchor,
    AppShell,
    Burger,
    Group,
    NavLink,
    Stack,
    Switch,
    Text,
    VisuallyHidden,
    useMantineColorScheme,
    useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import Link from "next/link";
import { FC, ReactNode } from "react";
import { FaHome, FaPencilAlt, FaTags } from "react-icons/fa";
import { FaImages } from "react-icons/fa6";
import { TbMoonStars, TbSun } from "react-icons/tb";
import { useAccount } from "wagmi";
import CometLogo from "../CometLogo";
import { EthBalance } from "../balance/EthBalance";
import { ConnectWalletButton } from "../wallet/ConnectWalletButton";
import { CreateSmartWalletButton } from "../wallet/CreateSmartWalletButton";

const Shell: FC<{ children: ReactNode }> = ({ children }) => {
    const [opened, { toggle: toggleMobileMenu, close: closeMobileMenu }] =
        useDisclosure();
    const theme = useMantineTheme();
    const showWalletNavbar = useMediaQuery(
        `(min-width:${theme.breakpoints.sm})`,
    );
    const showConnectSidebar = !showWalletNavbar;
    const { colorScheme, toggleColorScheme } = useMantineColorScheme({
        keepTransitions: true,
    });
    const { isConnected } = useAccount();
    const themeDefaultProps = theme.components?.AppShell?.defaultProps ?? {};

    return (
        <AppShell
            header={themeDefaultProps.header}
            navbar={{
                ...themeDefaultProps?.navbar,
                width: 180,
                collapsed: {
                    mobile: !opened,
                },
            }}
            padding={{ base: 10, sm: 15, lg: "xl" }}
        >
            <AppShell.Header data-testid="header" bg="haiti.9">
                <Group h="100%" px="md">
                    <Group justify="space-between" style={{ flex: 1 }}>
                        <Anchor component={Link} href="/" underline="never">
                            <Group gap={0}>
                                <CometLogo height={54} />
                                <Text
                                    mt="0.4rem"
                                    component="span"
                                    c="white"
                                    size="xl"
                                    fw="bold"
                                >
                                    COMET
                                </Text>
                            </Group>
                        </Anchor>
                        <Group ml={{ lg: "xl" }}>
                            {showWalletNavbar && (
                                <>
                                    <CreateSmartWalletButton />
                                    <ConnectWalletButton />
                                </>
                            )}
                            <Burger
                                color="white"
                                data-testid="burger-menu-btn"
                                opened={opened}
                                onClick={toggleMobileMenu}
                                hiddenFrom="sm"
                                size="sm"
                            />
                        </Group>
                    </Group>
                </Group>
            </AppShell.Header>
            <AppShell.Navbar py="md" px={4} data-testid="navbar">
                <Stack px={13} h="100%">
                    <NavLink
                        component={Link}
                        label="Home"
                        href="/"
                        leftSection={<FaHome />}
                        onClick={closeMobileMenu}
                        data-testid="home-link"
                    />

                    <NavLink
                        component={Link}
                        label="Comets"
                        onClick={closeMobileMenu}
                        href="/jams"
                        leftSection={<FaPencilAlt />}
                        data-testid="comets-link"
                    />

                    <NavLink
                        component={Link}
                        label="Collections"
                        onClick={closeMobileMenu}
                        href="/collections"
                        leftSection={<FaTags />}
                        data-testid="collections-link"
                    />

                    <NavLink
                        component={Link}
                        label="Imaginarium"
                        onClick={closeMobileMenu}
                        href="/imaginarium"
                        leftSection={<FaImages />}
                        data-testid="imaginarium-link"
                    />

                    <Stack style={{ marginTop: "auto" }} gap="lg">
                        {showConnectSidebar && (
                            <Stack gap="sm">
                                <Text c="dimmed" fw="bold" size="sm">
                                    Connectivity
                                </Text>
                                <Stack pl="sm">
                                    <CreateSmartWalletButton />
                                    <ConnectWalletButton />
                                </Stack>
                            </Stack>
                        )}

                        {isConnected && (
                            <Stack gap="sm">
                                <Text c="dimmed" fw="bold" size="sm">
                                    Your
                                </Text>
                                <Stack pl="sm">
                                    <EthBalance />
                                </Stack>
                            </Stack>
                        )}

                        <Stack gap="sm">
                            <Text c="dimmed" fw="bold" size="sm">
                                Settings
                            </Text>
                            <Group justify="space-between" pl="sm">
                                <Text c="dimmed">Mode</Text>
                                <Switch
                                    checked={colorScheme === "dark"}
                                    onChange={() => toggleColorScheme()}
                                    size="md"
                                    onLabel={
                                        <>
                                            <VisuallyHidden>
                                                Light Mode
                                            </VisuallyHidden>
                                            <TbSun
                                                color={theme.white}
                                                size="1rem"
                                            />
                                        </>
                                    }
                                    offLabel={
                                        <>
                                            <VisuallyHidden>
                                                Dark Mode
                                            </VisuallyHidden>
                                            <TbMoonStars
                                                color={theme.colors.gray[6]}
                                                size="1rem"
                                            />
                                        </>
                                    }
                                />
                            </Group>
                        </Stack>
                    </Stack>
                </Stack>
            </AppShell.Navbar>
            <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
    );
};
export default Shell;
