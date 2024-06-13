"use client";
import { Badge, Group, Stack, Text } from "@mantine/core";
import { FC } from "react";
import { CenteredErrorMessage } from "../CenteredErrorMessage";
import { CenteredLoaderBars } from "../CenteredLoaderBars";
import { useListVouchers } from "./queries";

export const VouchersView: FC = () => {
    const { data, isLoading, error } = useListVouchers();

    if (isLoading) {
        return <CenteredLoaderBars />;
    }

    if (error) {
        return <CenteredErrorMessage message={error.message} />;
    }

    if (!data) {
        return (
            <CenteredErrorMessage message="There are no vouchers to be presented" />
        );
    }

    const edges = data.vouchers.edges;

    console.log(edges);

    return (
        <>
            {edges.map((value, idx) => (
                <Stack key={idx}>
                    <Group gap="0">
                        <Badge radius={0}>Index</Badge>
                        <Text>{value.voucher.index}</Text>
                    </Group>
                    <Group gap={0}>
                        <Badge radius={0}>Dest</Badge>
                        <Text>{value.voucher.destination}</Text>
                    </Group>
                    <Group gap={0}>
                        <Badge radius={0}>Dest</Badge>
                        <Text>{value.voucher.payload}</Text>
                    </Group>
                </Stack>
            ))}
        </>
    );
};
