# typejam-twt

An experimental week project

#### Monorepo commands

Turborepo is controlling the monorepo based on `pipelines` described in the `turbo.json`. The commands ran from the root of the project will go through turborepo.

To Start the jam-ui (nextJS)

> Check the `.env.template` and copy the values inside to a new .env file and replace the values you need (i.e NEXT_PUBLIC_APP_ADDRESS in case your cartesi-app-address is different when deployed using cartesi/cli)

```
yarn dev
```

Nothing stops the dev to go inside the individual app and run its own npm-scripts for the sake of simplicity.
