import { Center } from "@mantine/core";
import { FC } from "react";
import { CometAlert } from "./CometAlert";

type ErrorProps = {
    message: string;
};

export const CenteredErrorMessage: FC<ErrorProps> = ({ message }) => {
    return (
        <Center>
            <CometAlert color="red" message={message} />
        </Center>
    );
};
