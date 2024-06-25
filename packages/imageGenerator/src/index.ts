import nodeHtmlToImage from "node-html-to-image";

type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

type Color = RGB | RGBA | HEX;

type LibOpts = Omit<Parameters<typeof nodeHtmlToImage>[0], "html">;

type Options = {
    // image background color
    backgroundColor: Color;
    // image text color
    textColor: Color;
    // node-html-to-image options excluding the html content that is generated.
    converterOptions: LibOpts;
};

type ContentReturned = ReturnType<typeof nodeHtmlToImage>;

type CreateImageFromContent = (
    contentList: string[],
    opt: Options,
) => ContentReturned;

function addParagraphs(list: string[]) {
    let paragraphs = "";
    list.forEach((text) => {
        paragraphs += `<p>${text}</p>`;
    });
    return paragraphs;
}

export const createImageFromContent: CreateImageFromContent = async (
    contentList,
    options,
) => {
    const bg = options.backgroundColor ?? "#352787";
    const txtColor = options.textColor ?? "#d5f5f2";
    const libOpts: LibOpts = {
        encoding: "base64",
        ...options.converterOptions,
    };

    const content = `
        <html>
            <head>
                <style>
                    html {
                     background-color: ${bg}
                    }
                    body {
                        width: 400px;
                        height: 400px;                         
                    }
                    p {
                        color: ${txtColor};
                        text-align:center;
                    }
                </style>
            </head>
            <body>
                ${addParagraphs(contentList)}
            </body>
        </html>
    `;

    return await nodeHtmlToImage({
        html: content,
        ...libOpts,
    });
};
