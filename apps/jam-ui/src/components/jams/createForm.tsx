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
import { useWaitForTransactionReceipt } from "wagmi";
import {
    useSimulateInputBoxAddInput,
    useWriteInputBoxAddInput,
} from "../../generated/wagmi-rollups";
import { useApplicationAddress } from "../../hooks/useApplicationAddress";
import { TransactionProgress } from "../TransactionProgress";

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
            hexInput: stringToHex(
                JSON.stringify({
                    action: "jam.create",
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
        <form id="create-jam-form">
            <Stack>
                <TextInput
                    label="Name"
                    description="The name of your JAM."
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
                    description="The first content of the collaboration jam."
                    withAsterisk
                    {...form.getInputProps("genesisEntry")}
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
                        confirmationMessage="JAM created successfully!"
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
                        Create
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
