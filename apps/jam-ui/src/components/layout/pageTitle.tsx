import { Group, Title } from "@mantine/core";
import { FC, JSX } from "react";

interface PageTitleProps {
    title: string;
    Icon: JSX.ElementType;
    iconSize?: number;
}

const PageTitle: FC<PageTitleProps> = ({ title, Icon, iconSize }) => {
    return (
        <Group mb="sm" data-testid="page-title">
            <Icon size={iconSize ?? 40} />
            <Title order={2}>{title}</Title>
        </Group>
    );
};

export default PageTitle;
