import { Button, Collapse, Group, Stack, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { FC, useEffect } from "react";
import { FaCheck } from "react-icons/fa";
import { stringToHex } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";
import {
    useSimulateInputBoxAddInput,
    useWriteInputBoxAddInput,
} from "../../generated/wagmi-rollups";
import { useApplicationAddress } from "../../hooks/useApplicationAddress";
import { TransactionProgress } from "../TransactionProgress";

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
        transformValues: (values) => ({
            hexInput: stringToHex(
                JSON.stringify({
                    action: "jam.append",
                    ...values,
                }),
            ),
        }),
    });

    const address = useApplicationAddress();

    const { hexInput } = form.getTransformedValues();

    const prepare = useSimulateInputBoxAddInput({
        args: [address, hexInput],
        query: {
            enabled: form.isValid(),
        },
    });

    const execute = useWriteInputBoxAddInput();
    const wait = useWaitForTransactionReceipt({
        hash: execute.data,
    });

    const loading = execute.isPending || wait.isLoading;
    const canSubmit = form.isValid() && prepare.error === null;

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
                        disabled={!canSubmit}
                        leftSection={<FaCheck />}
                        loading={loading}
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
