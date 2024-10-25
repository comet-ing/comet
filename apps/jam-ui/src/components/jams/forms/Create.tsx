"use client";
import {
    Button,
    Collapse,
    Group,
    NumberInput,
    Stack,
    Text,
    TextInput,
    Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { FC, useEffect } from "react";
import { FaCheck } from "react-icons/fa";
import { stringToHex } from "viem";
import { useAccount } from "wagmi";
import { useApplicationAddress } from "../../../hooks/useApplicationAddress";
import { useChainId } from "../../../hooks/useChainId";
import useEspressoSequencer from "../../../hooks/useEspressoSequencer";
import { CenteredErrorMessage } from "../../CenteredErrorMessage";

export interface Props {
    onSuccess?: () => void;
}

export const CreateJamForm: FC<Props> = ({ onSuccess }) => {
    const form = useForm({
        validateInputOnChange: true,
        initialValues: {
            name: "",
            description: "",
            mintPrice: 0,
            maxEntries: 20,
            genesisEntry: "",
        },
        validate: {
            name: (value) =>
                value === "" ? "Name is a required field!" : null,
            genesisEntry: (value) =>
                value === ""
                    ? "Entry is a required since it is the genesis of the collaboration"
                    : null,
        },
        transformValues: (values) => ({
            genesisEntry: values.genesisEntry,
            hexInput: stringToHex(
                JSON.stringify({
                    action: "jam.create",
                    ...values,
                }),
            ),
        }),
    });
    const chainId = useChainId();
    const { address } = useAccount();
    const appAddress = useApplicationAddress();
    const { status, error, submitTransaction, reset } = useEspressoSequencer({
        account: address,
        appAddress,
        chainId,
    });

    useEffect(() => {
        if (status === "success") {
            reset();
            form.reset();
            if (onSuccess !== undefined && onSuccess instanceof Function) {
                onSuccess();
            }
        }
    }, [status, onSuccess, form, reset]);

    return (
        <form id="create-jam-form">
            <Stack>
                <TextInput
                    label="Name"
                    description="The name of your Comet."
                    placeholder="My majestic journey through life"
                    withAsterisk
                    {...form.getInputProps("name")}
                    error={form.errors?.name}
                />

                <NumberInput
                    hideControls
                    allowNegative={false}
                    label="Price"
                    description="Price to mint the work when completed."
                    rightSection={<Text>ETH</Text>}
                    rightSectionWidth={60}
                    withAsterisk
                    {...form.getInputProps("mintPrice")}
                />

                <NumberInput
                    hideControls
                    allowNegative={false}
                    min={1}
                    max={20}
                    label="Entries"
                    description="The number of entries for this work. That also means the number of creators since it is one contribution per address."
                    withAsterisk
                    {...form.getInputProps("maxEntries")}
                />

                <Textarea
                    autosize
                    minRows={2}
                    maxRows={5}
                    resize="vertical"
                    label="Description"
                    description="The theme behind this work of art. That helps coming collaborators to get the essence"
                    withAsterisk
                    {...form.getInputProps("description")}
                />

                <Textarea
                    autosize
                    minRows={2}
                    maxRows={5}
                    resize="vertical"
                    label="Genesis entry"
                    description="The first content of the collaboration."
                    withAsterisk
                    {...form.getInputProps("genesisEntry")}
                />

                <Collapse in={status === "error"}>
                    <CenteredErrorMessage
                        message={error?.message ?? "Something went wrong"}
                    />
                </Collapse>

                <Group justify="right">
                    <Button
                        variant="outline"
                        disabled={!form.isValid()}
                        leftSection={<FaCheck />}
                        loading={status === "loading"}
                        onClick={() =>
                            submitTransaction({
                                action: "jam.create",
                                ...form.values,
                            })
                        }
                    >
                        Create (L2)
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
