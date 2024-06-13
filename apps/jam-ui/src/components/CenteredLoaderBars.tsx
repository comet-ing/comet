import { Center, Loader, LoaderProps } from "@mantine/core";
import { FC } from "react";

interface CenteredLoaderBarsProps extends Pick<LoaderProps, "size"> {}

export const CenteredLoaderBars: FC<CenteredLoaderBarsProps> = ({ size }) => (
    <Center>
        <Loader type="bars" size={size} />
    </Center>
);
