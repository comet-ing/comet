import chalk from "chalk";
import { access, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const log = console.log;

export async function createDirIfNotExist(targetFolder) {
    try {
        await access(targetFolder, constants.F_OK);
    } catch (_err) {
        await mkdir(targetFolder, { recursive: true });
    }

    return true;
}

export async function writeDeploymentInfo({ filename, content, outFolder }) {
    const filePath = join(outFolder, filename);

    log(chalk.yellow(`\nSaving deployment information...`));

    await createDirIfNotExist(outFolder);

    await writeFile(filePath, content, { encoding: "utf-8" });

    log(chalk.cyan(`\nDeployment information saved at ${filePath}`));

    return true;
}
