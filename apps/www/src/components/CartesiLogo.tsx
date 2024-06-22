import { FC } from "react";

interface Props {
    width: number;
    height: number;
    color?: string;
}

export const CartesiLogo: FC<Props> = ({ height, width, color }) => {
    const fill = color ?? "#008da5";
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            id="Layer_2"
            data-name="Layer 2"
            viewBox="0 0 350.2 344"
            height={height}
            width={width}
        >
            <defs></defs>
            <polygon
                fill={fill}
                points="123.9 237.9 167.4 344 264.2 245.2 190.8 245.2 171.2 189.6 123.9 237.9"
            />
            <polygon
                fill={fill}
                points="241.5 117.9 186 174.5 204.2 226.1 350.2 226.1 312.1 117.9 241.5 117.9"
            />
            <polygon
                fill={fill}
                points="0 117.9 38.1 226.1 108.7 226.1 164.1 169.6 145.9 117.9 0 117.9"
            />
            <polygon
                fill={fill}
                points="182.8 0 86 98.8 159.4 98.8 179 154.4 226.3 106.2 182.8 0"
            />
        </svg>
    );
};
