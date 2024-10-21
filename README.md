# Comet dApp

A decentralised co-creation text platform powered by Cartesi and Espresso. Comet allows you to jam on poems, stories, lyrics, quips and present your work as ERC1155 token for collectors.

#### Monorepo commands

Turborepo is controlling the monorepo based on `pipelines` described in the `turbo.json`. The commands ran from the root of the project will go through turborepo.

## To Start the frontend i.e. `apps/jam-ui` (nextJS)

1. Check the `.env.template` and copy the values inside to a new `.env` file and replace the values you need (i.e NEXT_PUBLIC_APP_ADDRESS in case your cartesi-app-address is different when deployed using cartesi/cli)
2. Run the following command

```
yarn dev
```

Nothing stops the dev to go inside the individual app and run its own npm-scripts for the sake of simplicity.

## To start the backend i.e. `apps/jam-backend`
Follow the instructions in the README file `./apps/jam-backend/README.md`
