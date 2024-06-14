import { Alert } from "@mantine/core";
import { FC, ReactNode } from "react";
import { FaInfoCircle } from "react-icons/fa";

type Props = {
    title?: string;
    message: string | ReactNode;
};

export const InfoMessage: FC<Props> = ({ message, title }) => (
    <Alert variant="light" color="blue" icon={<FaInfoCircle />} title={title}>
        {message}
    </Alert>
);
