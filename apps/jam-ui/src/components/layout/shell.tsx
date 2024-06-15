"use client";
import {
    AppShell,
    Burger,
    Group,
    NavLink,
    Stack,
    Switch,
    VisuallyHidden,
    useMantineColorScheme,
    useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { FC, ReactNode } from "react";
import { FaHome, FaPencilAlt, FaTags } from "react-icons/fa";
import { TbMoonStars, TbSun } from "react-icons/tb";

const Shell: FC<{ children: ReactNode }> = ({ children }) => {
    const [opened, { toggle: toggleMobileMenu, close: closeMobileMenu }] =
        useDisclosure();
    const theme = useMantineTheme();
    const { colorScheme, toggleColorScheme } = useMantineColorScheme({
        keepTransitions: true,
    });
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
            <AppShell.Header data-testid="header">
                <Group h="100%" px="md">
                    <Burger
                        data-testid="burger-menu-btn"
                        opened={opened}
                        onClick={toggleMobileMenu}
                        hiddenFrom="sm"
                        size="sm"
                    />
                    <Group justify="space-between" style={{ flex: 1 }}>
                        <Link href="/">JAM TWT LOGO</Link>
                        <Group ml={{ lg: "xl" }}>
                            <ConnectButton />
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
                    </Group>
                </Group>
            </AppShell.Header>
            <AppShell.Navbar py="md" px={4} data-testid="navbar">
                <Stack px={13}>
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
                        label="Jams"
                        onClick={closeMobileMenu}
                        href="/jams"
                        leftSection={<FaPencilAlt />}
                        data-testid="jams-link"
                    />

                    <NavLink
                        component={Link}
                        label="Collections"
                        onClick={closeMobileMenu}
                        href="/collections"
                        leftSection={<FaTags />}
                        data-testid="jams-link"
                    />
                </Stack>
            </AppShell.Navbar>
            <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
    );
};
export default Shell;
