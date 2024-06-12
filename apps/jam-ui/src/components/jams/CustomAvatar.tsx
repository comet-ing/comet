import { Avatar, Tooltip } from "@mantine/core";
import { FC } from "react";
import { jsNumberForAddress } from "react-jazzicon";
import Jazzicon from "react-jazzicon/dist/Jazzicon";
import { Hex } from "viem";

type CustomAvatarProps = {
    address: Hex;
    size: number;
};

export const CustomAvatar: FC<CustomAvatarProps> = ({ address, size = 24 }) => {
    return (
        <Tooltip label={address}>
            <Avatar variant="transparent">
                <Jazzicon diameter={size} seed={jsNumberForAddress(address)} />
            </Avatar>
        </Tooltip>
    );
};
