"use client";
import { Button, Collapse, Group, Stack, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { FC, useEffect } from "react";
import { FaCheck } from "react-icons/fa";
import { Hex, stringToHex } from "viem";
import { useAddInput } from "../../../hooks/useAddInput";
import { charactersLeft } from "../../../utils/functions";
import { CenteredErrorMessage } from "../../CenteredErrorMessage";
import { JAM_ENTRY_CHAR_LIMIT } from "./constants";

export interface Props {
    onSuccess?: () => void;
    jamId: number;
}

export const ContributeJamForm: FC<Props> = ({ onSuccess, jamId }) => {
    const form = useForm({
        validateInputOnChange: true,
        initialValues: {
            jamID: jamId,
            entry: "",
        },
        validate: {
            entry: (value) =>
                value === ""
                    ? "Entry is required to contribute to this Comet"
                    : null,
        },
        transformValues: (values) => {
            let hexInput: Hex = "0x0";

            if (values.entry !== "") {
                hexInput = stringToHex(
                    JSON.stringify({
                        action: "jam.append",
                        ...values,
                    }),
                );
            }
            return { hexInput };
        },
    });

    const { status, error, reset, submitTransaction } = useAddInput();

    useEffect(() => {
        if (status === "success") {
            reset();
            form.reset();
            if (onSuccess !== undefined && onSuccess instanceof Function) {
                onSuccess();
            }
        }
    }, [status, onSuccess, form, reset]);

    const entryCharactersLeft = charactersLeft(
        form.getValues().entry,
        JAM_ENTRY_CHAR_LIMIT,
    ).left;

    return (
        <form id="contribute-form">
            <Stack>
                <Textarea
                    autosize
                    minRows={2}
                    maxRows={5}
                    maxLength={JAM_ENTRY_CHAR_LIMIT}
                    resize="vertical"
                    label="Entry"
                    description="Contribute to the Comet content."
                    rightSection={
                        entryCharactersLeft === 0 ? "" : entryCharactersLeft
                    }
                    withAsterisk
                    {...form.getInputProps("entry")}
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
                                action: "jam.append",
                                ...form.values,
                            })
                        }
                    >
                        ADD
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
