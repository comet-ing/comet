"use client";
import {
    Anchor,
    Box,
    Button,
    Container,
    Group,
    Stack,
    Text,
    Title,
    Tooltip,
    getThemeColor,
    useMantineTheme,
} from "@mantine/core";
import Link from "next/link";
import { FaGithub, FaXTwitter } from "react-icons/fa6";
import useCometAppUrl from "../hooks/useCometAppUrl";
import { horizonOutline2 } from "../styles/fonts";
import styles from "../styles/modules/app.module.css";
import { CartesiLogo } from "./CartesiLogo";
import CometLogo from "./CometLogo";
import { EspressoLogo } from "./ExpressoLogo";

const HomeView = () => {
    const theme = useMantineTheme();
    const cometAppUrl = useCometAppUrl();
    const cyan = getThemeColor("cyan", theme);
    const color = "#161038";
    const textColor = "#DCEAD3";

    return (
        <Container fluid h="100%" m={0} p={0}>
            <Stack h="100%" justify="center" align="center">
                <Box pl="xl" component="div" id="logo-box">
                    <CometLogo height={300} color={color} />
                </Box>
                <Title
                    className={horizonOutline2.className}
                    fw={900}
                    order={1}
                    c={textColor}
                    style={{ fontSize: "4rem" }}
                >
                    COMET
                </Title>
                <Text size="xl" c={textColor} style={{ textAlign: "center" }}>
                    Co-create and mint stories, poems, quips
                </Text>

                <Stack mt="5rem" gap="xs">
                    <Group gap="8" justify="center">
                        <Text size="sm" c={textColor}>
                            powered by
                        </Text>
                        <Tooltip label="Cartesi Rollups">
                            <Anchor
                                href="https://cartesi.io/"
                                target="_blank"
                                h={35}
                            >
                                <CartesiLogo
                                    width={34}
                                    height={34}
                                    color={cyan}
                                />
                            </Anchor>
                        </Tooltip>

                        <Tooltip label="Espresso Sequencer">
                            <Anchor
                                href="https://www.espressosys.com/"
                                target="_blank"
                                h={35}
                            >
                                <EspressoLogo width={33} height={34} />
                            </Anchor>
                        </Tooltip>
                    </Group>

                    <Button
                        variant="outline"
                        component={Link}
                        href={cometAppUrl}
                        my="md"
                        className={styles.enter_app_btn}
                        c="#b77237"
                    >
                        <Text>Enter the App</Text>
                    </Button>
                </Stack>
                <Group py="lg">
                    <Anchor
                        href="https://x.com/comet_ing"
                        target="_blank"
                        underline="never"
                    >
                        <FaXTwitter color={textColor} />
                    </Anchor>

                    <Anchor href="https://github.com/comet-ing" target="_blank">
                        <FaGithub color={textColor} />
                    </Anchor>
                </Group>
            </Stack>
        </Container>
    );
};

export default HomeView;
