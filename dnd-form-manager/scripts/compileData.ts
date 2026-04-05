/**
 * compileData.ts
 *
 * Reads each JSON file from src/data/raw/*,
 * validates every entry against its category JSON Schema, and writes merged
 * arrays to src/data/*.json for each supported category.
 *
 * Usage:  tsx scripts/compileData.ts
 * Runs automatically as a pre-step before `dev` and `build` via package.json.
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';

const __dirname = dirname(fileURLToPath(import.meta.url));

const dataDir    = resolve(__dirname, '../src/data');
const rawDir     = resolve(dataDir, 'raw');
const schemasDir = resolve(dataDir, 'schemas');

// ---------------------------------------------------------------------------
// Load schemas
// ---------------------------------------------------------------------------

const definitionsSchema = JSON.parse(
  readFileSync(resolve(schemasDir, 'definitions.json'), 'utf-8')
);
const classSchema = JSON.parse(
  readFileSync(resolve(schemasDir, 'class_data_schema.json'), 'utf-8')
);
const raceSchema = JSON.parse(
  readFileSync(resolve(schemasDir, 'race_data_schema.json'), 'utf-8')
);
const itemSchema = JSON.parse(
  readFileSync(resolve(schemasDir, 'item_data_schema.json'), 'utf-8')
);
const spellSchema = JSON.parse(
  readFileSync(resolve(schemasDir, 'spell_data_schema.json'), 'utf-8')
);
const featSchema = JSON.parse(
  readFileSync(resolve(schemasDir, 'feat_data_schema.json'), 'utf-8')
);
const subclassSchema = JSON.parse(
  readFileSync(resolve(schemasDir, 'subclass_data_schema.json'), 'utf-8')
);
const subraceSchema = JSON.parse(
  readFileSync(resolve(schemasDir, 'subrace_data_schema.json'), 'utf-8')
);
const traitSchema = JSON.parse(
  readFileSync(resolve(schemasDir, 'trait_data_schema.json'), 'utf-8')
);

// Ajv instance — strict:false to stay compatible with draft-07 constructs;
// validateSchema:false prevents Ajv 8 from trying to fetch the draft-07 meta-schema URI
const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });

// Register definitions so that $ref: "definitions.json#/definitions/..." resolves
ajv.addSchema(definitionsSchema);

const validateClass = ajv.compile(classSchema);
const validateRace  = ajv.compile(raceSchema);
const validateItem = ajv.compile(itemSchema);
const validateSpell = ajv.compile(spellSchema);
const validateFeat = ajv.compile(featSchema);
const validateSubclass = ajv.compile(subclassSchema);
const validateSubrace  = ajv.compile(subraceSchema);
const validateTrait  = ajv.compile(traitSchema);

type ValidateFn = ReturnType<typeof ajv.compile>;

// ---------------------------------------------------------------------------
// Core compilation helper
// ---------------------------------------------------------------------------

function compileFolder(
  folderName: string,
  validate: ValidateFn,
  outputFileName: string,
): void {
  const folderPath = resolve(rawDir, folderName);
  const files = readdirSync(folderPath)
    .filter((f: string) => f.endsWith('.json'))
    .sort();

  let hasErrors = false;
  const compiled: unknown[] = [];

  for (const file of files) {
    const filePath = resolve(folderPath, file);
    let data: unknown;

    try {
      data = JSON.parse(readFileSync(filePath, 'utf-8'));
    } catch (err) {
      console.error(`[ERROR] Could not parse ${folderName}/${file}: ${(err as Error).message}`);
      hasErrors = true;
      continue;
    }

    if (validate(data)) {
      compiled.push(data);
    } else {
      hasErrors = true;
      for (const error of validate.errors ?? []) {
        const location = error.instancePath || '(root)';
        console.error(`[ERROR] ${folderName}/${file} → ${location}: ${error.message}`);
      }
    }
  }

  if (hasErrors) {
    console.error(`\nAborting: one or more files in raw/${folderName}/ failed schema validation.`);
    process.exit(1);
  }

  writeFileSync(resolve(dataDir, outputFileName), JSON.stringify(compiled, null, 2) + '\n');
  console.log(`  ✓  ${compiled.length} entries  →  src/data/${outputFileName}`);
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

console.log('\nCompiling raw data files...');
compileFolder('classes', validateClass, 'classes.json');
compileFolder('races',   validateRace,  'races.json');
compileFolder('items', validateItem, 'items.json');
compileFolder('spells', validateSpell, 'spells.json');
compileFolder('feats', validateFeat, 'feats.json');
compileFolder('subclasses', validateSubclass, 'subclasses.json');
compileFolder('subraces', validateSubrace, 'subraces.json');
compileFolder('traits', validateTrait, 'traits.json');
console.log('Data compilation complete.\n');
