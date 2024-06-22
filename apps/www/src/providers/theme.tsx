import {
    DEFAULT_THEME,
    MantineThemeOverride,
    createTheme,
    mergeMantineTheme,
} from "@mantine/core";
import { blueViolet, downy, haiti, kidnapper } from "./colors";

const themeOverride: MantineThemeOverride = createTheme({
    cursorType: "pointer",
    fontFamily: "Open Sans, sans-serif",
    primaryColor: "haiti",
    colors: {
        haiti,
        blueViolet,
        downy,
        kidnapper,
    },
});

export const theme = mergeMantineTheme(DEFAULT_THEME, themeOverride);
