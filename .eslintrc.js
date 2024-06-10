module.exports = {
    root: true,
    // This tells ESLint to load the config from the package `eslint-config-jam`
    extends: ["jam"],
    settings: {
        next: {
            rootDir: ["apps/*/"],
        },
    },
};
