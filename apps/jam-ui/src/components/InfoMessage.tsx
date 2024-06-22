import { FC, ReactNode } from "react";
import { CometAlert } from "./CometAlert";

type Props = {
    title?: string;
    message: string | ReactNode;
};

export const InfoMessage: FC<Props> = ({ message, title }) => (
    <CometAlert color="blue" message={message} title={title} />
);
