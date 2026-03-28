# What this project is

This project is a wrapper for vintage story web cartographer API of [th3dilli_vintagestory/WebCartographer](https://gitlab.com/th3dilli_vintagestory/WebCartographer) mod.

It does not function as the original WebCartographer mod/website and depends on the API this mod and original application provies.

Theoretically you could (and probably should've in my case) forked it and made a wrapper there, but I just didn't lol.

This project adds the ability to have custom stored map Features and Images in the database. This allows for more customizable archiving abilities and structure tracking.

# What this project is NOT

This project IS NOT A MOD, this is a fullstack web application aims to provide improved archiving capabilities of modern map.

## Develop

First, install dependencies:

```bash
yarn
```

After this, create a `.env` file and copy the contents of `.env.example` into `.env`.

Then, run the development environment:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Useful commands:

- `yarn drizzle:generate {name}` - generate a new migration after changing models.
- `yarn drizzle:migrate` - migrates all changes to be up to date with the drizzle schema.
- `yarn drizzle:seed` - seed db with test data.
- `yarn drizzle:drop` - drops all current data from db. (Warning, obviously removes data!!!)

## Notes:

- All server actions must be annotated with 'use server' as their first line. This keeps them protected from client side.
- Wrap functions in `protect(fn)` if they need user token payload info OR need to be protected by unauthorized users.
- Ensure you are adding both locales when adding new messages / errors / text
