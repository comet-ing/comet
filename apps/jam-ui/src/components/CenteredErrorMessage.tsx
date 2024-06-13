import { Alert, Center } from "@mantine/core";
import { FC } from "react";
import { FaInfoCircle } from "react-icons/fa";

type ErrorProps = {
    message: string;
};

export const CenteredErrorMessage: FC<ErrorProps> = ({ message }) => {
    return (
        <Center>
            <Alert variant="light" color="red" icon={<FaInfoCircle />}>
                {message}
            </Alert>
        </Center>
    );
};
