import {
    Anchor,
    Button,
    Group,
    Modal,
    Stack,
    Text,
    Title,
    Transition,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { FC, useCallback } from "react";
import { FaEthereum } from "react-icons/fa";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { WithdrawBalanceForm } from "./WithdrawBalanceForm";
import { balanceKeys, useGetBalance } from "./queries";

export const EthBalance: FC = () => {
    const { isConnected, address } = useAccount();
    const queryClient = useQueryClient();
    const { data, error } = useGetBalance(address);
    const [showform, { open: openModal, close: closeModal }] =
        useDisclosure(false);

    const onSuccess = useCallback(() => {
        notifications.show({
            autoClose: false,
            title: <Title order={4}>Nice!</Title>,
            message: (
                <Group>
                    <Text>Request to withdraw confirmed</Text>
                    <Anchor component={Link} href="/collections">
                        Check your collections
                    </Anchor>
                </Group>
            ),
        });

        closeModal();
        if (address) {
            setTimeout(() => {
                queryClient.invalidateQueries({
                    queryKey: balanceKeys.detail(address),
                });
            }, 1000);
        }
    }, [closeModal, queryClient, address]);

    if (!isConnected || error || data === undefined) {
        return "";
    }

    const hasBalance = data > 0;

    return (
        <Stack>
            <Group justify="space-between">
                <Text c="dimmed">App balance</Text>
                <Text>{formatEther(data)} ETH</Text>
            </Group>
            <Transition
                mounted={hasBalance}
                transition="scale-x"
                duration={400}
                timingFunction="ease"
            >
                {(styles) => (
                    <Button
                        style={styles}
                        onClick={openModal}
                        leftSection={<FaEthereum />}
                    >
                        Withdraw
                    </Button>
                )}
            </Transition>
            <Modal
                opened={showform}
                onClose={closeModal}
                title="Request Withdraw"
            >
                <WithdrawBalanceForm onSuccess={onSuccess} balance={data} />
            </Modal>
        </Stack>
    );
};
