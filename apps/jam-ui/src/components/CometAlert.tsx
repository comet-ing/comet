import { Alert, AlertProps } from "@mantine/core";
import { FC, ReactNode } from "react";
import { FaExclamationCircle } from "react-icons/fa";

interface CometAlertProps extends Omit<AlertProps, "children" | "icon"> {
    message: string | ReactNode;
}

export const CometAlert: FC<CometAlertProps> = (props) => (
    <Alert
        variant="light"
        title="Humm!?"
        icon={<FaExclamationCircle />}
        {...props}
    >
        {props.message}
    </Alert>
);
