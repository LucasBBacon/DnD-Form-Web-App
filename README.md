# D&D 5E Live Sheet

This repository contains a live character sheet for Dungeons & Dragons 5E, focused on the 2014 ruleset. It is designed to be the table-facing version of the character sheet: the UI keeps combat stats, inventory, spellcasting, level progression, and roleplay details in sync as the character changes.

The app is intentionally data driven. Most race, class, feat, item, trait, and spell information comes from authored JSON sources that are compiled into the runtime data used by the sheet. That keeps the UI flexible and makes it easier to extend the rules support without hardcoding content into components.

## What The App Does

The sheet is organized around the same workflows players use at the table:

- Character creation and setup through a wizard-driven flow.
- A live character sheet with core stats, defenses, inventory, spellbook, traits, and roleplay details.
- Level-up handling, including choices that must be resolved before progressing.
- Short-rest and other state changes that affect the current character.
- Support for combat-facing calculations such as armor class, attacks, skills, and spellcasting.

The entry point switches between the creation wizard and the live character sheet based on whether setup is complete. In development, the app can also load named scenario fixtures from the `?scenario=` query parameter to make edge cases easy to reproduce.

## Tech Stack

- React 19
- TypeScript
- Vite
- Zustand for character state
- Vitest and Testing Library for tests
- Storybook for component development and visual review

## Project Structure

The codebase is split by responsibility rather than by page:

- `src/components` contains the sheet boards, wizard, modals, and reusable UI.
- `src/store` contains the character state and the actions that mutate it.
- `src/hooks` contains derived gameplay logic such as stats, attacks, skills, spellcasting, and creation requirements.
- `src/data` contains authored source data, schema helpers, and compiled static data.
- `src/dev` contains scenario builders used for development-time hydration.
- `src/utils` contains shared rule calculations and helper logic.
- `src/types` contains the domain types used throughout the app.

## Data Workflow

The raw game data is compiled before development and production builds. If you change content under `src/data/raw`, rerun the compile step so the generated data stays in sync.

```bash
npm run compile-data
```

That compile step also runs automatically before `dev` and `build`.

## Common Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
npm run storybook
npm run build-storybook
npm run compile-data
```

There is no `npm test` script in this repo. Run Vitest directly when you need to execute tests:

```bash
npm exec vitest run
```

## Development Notes

- If you need to inspect a specific character state locally, use the `?scenario=` query parameter in development.
- When updating raw class, race, feat, item, trait, or spell data, validate the generated output with the compile step before relying on the UI.
- Some mechanics are intentionally calculated in shared utilities so that the sheet, tests, and Storybook fixtures stay aligned.

## Rules And Data Notes

- Subclass progression can include optional `subclassSpecificScaling` values.
- Scaling values must stay scalar; arrays and objects are invalid.
- Scaling keys merge by character level, with higher-level entries overriding lower-level entries for the same key.
- Keys currently consumed by character stats include `initiative`, `initiative_bonus`, `ac`, `armor_class`, and `speed`.

If you are extending the rules engine, keep the data definitions and the runtime calculations aligned. A change that affects character stats usually needs updates in the authored data, the utility layer, and at least one focused test.
