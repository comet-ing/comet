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
import { charactersLeft } from "../../../utils/functions";
import { CenteredErrorMessage } from "../../CenteredErrorMessage";
import { JAM_DESCRIPTION_CHAR_LIMIT, JAM_ENTRY_CHAR_LIMIT } from "./constants";

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
            description: (value) =>
                value === "" ? "A description is a required field" : null,
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

    const genesisEntryCharactersLeft = charactersLeft(
        form.getValues().genesisEntry,
        JAM_ENTRY_CHAR_LIMIT,
    ).left;
    const descriptionCharactersLeft = charactersLeft(
        form.getValues().description,
        JAM_DESCRIPTION_CHAR_LIMIT,
    ).left;

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
                    min={2}
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
                    maxLength={JAM_DESCRIPTION_CHAR_LIMIT}
                    resize="vertical"
                    label="Description"
                    description="The theme behind this work of art. That helps coming collaborators to get the essence"
                    rightSection={
                        descriptionCharactersLeft === 0
                            ? ""
                            : descriptionCharactersLeft
                    }
                    withAsterisk
                    {...form.getInputProps("description")}
                />

                <Textarea
                    autosize
                    minRows={2}
                    maxRows={5}
                    resize="vertical"
                    maxLength={JAM_ENTRY_CHAR_LIMIT}
                    label="Genesis entry"
                    description="The first content of the collaboration."
                    rightSection={
                        genesisEntryCharactersLeft === 0
                            ? ""
                            : genesisEntryCharactersLeft
                    }
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
                        Create
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
