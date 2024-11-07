"use client";
import { Text, TextProps } from "@mantine/core";
import { FC } from "react";
import { getAddress } from "viem";
import useFindENSData from "../hooks/useFindENSData";

const shortenText = (value: string) =>
    `${value.slice(0, 5)}...${value.slice(-3)}`;

interface Props extends TextProps {
    address: string;
    shorten?: boolean;
}

const AddressOrENSName: FC<Props> = ({ address, shorten = true, ...rest }) => {
    const { data, isLoading } = useFindENSData(getAddress(address));
    const hasName = !isLoading && data?.name;
    const text = shorten ? shortenText(address) : address;

    return (
        <>
            {!hasName ? (
                <Text {...rest}>{text}</Text>
            ) : (
                <Text fw={500} c="blue">
                    {data?.name}
                </Text>
            )}
        </>
    );
};

export default AddressOrENSName;
