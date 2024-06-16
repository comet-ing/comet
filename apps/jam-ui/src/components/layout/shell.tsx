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
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { FC, ReactNode } from "react";
import { FaHome, FaPencilAlt, FaTags } from "react-icons/fa";
import { TbMoonStars, TbSun } from "react-icons/tb";
import { ActionMenu } from "../ActionMenu";
import CometLogo from "../CometLogo";

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
            <AppShell.Header data-testid="header" bg="haiti.9">
                <Group h="100%" px="md">
                    <Burger
                        color="white"
                        data-testid="burger-menu-btn"
                        opened={opened}
                        onClick={toggleMobileMenu}
                        hiddenFrom="sm"
                        size="sm"
                    />
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
                        {/* <Link href="/"></Link> */}
                        <Group ml={{ lg: "xl" }}>
                            <ActionMenu />
                            {/* <ConnectButton /> */}
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
                        label="Comets"
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
