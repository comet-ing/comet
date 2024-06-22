"use client";
import {
    Anchor,
    Box,
    Container,
    Group,
    Stack,
    Text,
    Title,
    getThemeColor,
    useMantineTheme,
} from "@mantine/core";
import { FaGithub, FaXTwitter } from "react-icons/fa6";
import { horizonOutline2 } from "../styles/fonts";
import { BaseLogoWhite } from "./BaseLogo";
import { CartesiLogo } from "./CartesiLogo";
import CometLogo from "./CometLogo";

const HomeView = () => {
    const theme = useMantineTheme();
    const cyan = getThemeColor("cyan", theme);
    const color = "#161038";
    const textColor = "#DCEAD3";

    return (
        <Container fluid h="100%" m={0} p={0} bg={color}>
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
                    <Group gap={8} justify="center">
                        <Text size="sm" c={textColor}>
                            Coming on
                        </Text>
                        <Anchor
                            href="https://www.base.org/"
                            target="_blank"
                            h={35}
                        >
                            <BaseLogoWhite width={64} height={34} />
                        </Anchor>
                    </Group>
                    <Group gap="8" justify="center">
                        <Text size="sm" c={textColor}>
                            powered by
                        </Text>
                        <Anchor
                            href="https://cartesi.io/"
                            target="_blank"
                            h={35}
                        >
                            <CartesiLogo width={34} height={34} color={cyan} />
                        </Anchor>
                    </Group>
                </Stack>
                <Group>
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
