import Image from "next/image";
import { FC } from "react";

interface Props {
    width: number;
    height: number;
}

export const BaseLogoWhite: FC<Props> = ({ height, width }) => (
    <Image
        src="/base-logo.svg"
        alt="Base blockchain logo"
        width={width}
        height={height}
    />
);
