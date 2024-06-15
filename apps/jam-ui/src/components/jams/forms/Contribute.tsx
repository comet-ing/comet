"use client";
import { Button, Collapse, Group, Stack, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedValue } from "@mantine/hooks";
import { FC, useEffect } from "react";
import { FaCheck } from "react-icons/fa";
import { Hex, stringToHex } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";
import {
    useSimulateInputBoxAddInput,
    useWriteInputBoxAddInput,
} from "../../../generated/wagmi-rollups";
import { useApplicationAddress } from "../../../hooks/useApplicationAddress";
import { TransactionProgress } from "../../TransactionProgress";
import { transactionState } from "../../TransactionState";

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
                    ? "Entry is required to contribute to this JAM"
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

    const address = useApplicationAddress();

    const { hexInput } = form.getTransformedValues();

    const prepare = useSimulateInputBoxAddInput({
        args: [address, hexInput],
        query: {
            enabled: address !== null && hexInput !== "0x0",
        },
    });

    const execute = useWriteInputBoxAddInput();
    const wait = useWaitForTransactionReceipt({
        hash: execute.data,
    });

    const { disabled: appendDisabled, loading: appendLoading } =
        transactionState(prepare, execute, wait, true);

    const loading = execute.isPending || wait.isLoading || appendLoading;
    const canSubmit =
        form.isValid() && prepare.error === null && !appendDisabled;

    const [debouncedLoading] = useDebouncedValue(loading, 500);
    const [debouncedCanSubmit] = useDebouncedValue(canSubmit, 500);

    useEffect(() => {
        if (wait.isSuccess) {
            form.reset();
            execute.reset();

            if (onSuccess !== undefined && onSuccess instanceof Function) {
                onSuccess();
            }
        }
    }, [wait.isSuccess, onSuccess, form, execute]);

    return (
        <form id="append-jam-form">
            <Stack>
                <Textarea
                    autosize
                    minRows={2}
                    maxRows={5}
                    resize="vertical"
                    label="Entry"
                    description="Contribute to the JAM content."
                    withAsterisk
                    {...form.getInputProps("entry")}
                />

                <Collapse
                    in={
                        execute.isPending ||
                        wait.isLoading ||
                        execute.isSuccess ||
                        execute.isError
                    }
                >
                    <TransactionProgress
                        prepare={prepare}
                        execute={execute}
                        wait={wait}
                        confirmationMessage="Entry sent successfully!"
                        defaultErrorMessage={execute.error?.message}
                    />
                </Collapse>

                <Group justify="right">
                    <Button
                        variant="filled"
                        disabled={!debouncedCanSubmit}
                        leftSection={<FaCheck />}
                        loading={debouncedLoading}
                        onClick={() =>
                            execute.writeContract(prepare.data!.request)
                        }
                    >
                        ADD
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
