"use client";
import { Avatar, Tooltip } from "@mantine/core";

import { FC } from "react";
import { jsNumberForAddress } from "react-jazzicon";
import Jazzicon from "react-jazzicon/dist/Jazzicon";
import { Hex } from "viem";
import useFindENSData from "../../hooks/useFindENSData";

type CustomAvatarProps = {
    address: Hex;
    size: number;
};

export const CustomAvatar: FC<CustomAvatarProps> = ({ address, size = 24 }) => {
    const { data, isLoading } = useFindENSData(address);
    const hasAvatar = !isLoading && data?.avatar !== undefined;

    return (
        <Tooltip label={address}>
            <Avatar
                variant="transparent"
                src={data?.avatar ?? ""}
                alt={`Avatar for address ${address}`}
            >
                {!hasAvatar && (
                    <Jazzicon
                        diameter={size}
                        seed={jsNumberForAddress(address)}
                    />
                )}
            </Avatar>
        </Tooltip>
    );
};
