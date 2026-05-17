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
import { resolve, dirname, relative } from 'node:path';
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
const itemCategorySchema = JSON.parse(
  readFileSync(resolve(schemasDir, 'item_category_data_schema.json'), 'utf-8')
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
const actionSchema = JSON.parse(
  readFileSync(resolve(schemasDir, 'action_data_schema.json'), 'utf-8')
);

// Ajv instance — strict:false to stay compatible with draft-07 constructs;
// validateSchema:false prevents Ajv 8 from trying to fetch the draft-07 meta-schema URI
const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });

// Register definitions so that $ref: "definitions.json#/definitions/..." resolves
ajv.addSchema(definitionsSchema);

const validateClass = ajv.compile(classSchema);
const validateRace  = ajv.compile(raceSchema);
const validateItem = ajv.compile(itemSchema);
const validateItemCategory = ajv.compile(itemCategorySchema);
const validateSpell = ajv.compile(spellSchema);
const validateFeat = ajv.compile(featSchema);
const validateSubclass = ajv.compile(subclassSchema);
const validateSubrace  = ajv.compile(subraceSchema);
const validateTrait  = ajv.compile(traitSchema);
const validateAction = ajv.compile(actionSchema);

type ValidateFn = ReturnType<typeof ajv.compile>;

type JsonSourceFile = {
  filePath: string;
  relativePath: string;
};

function validateSpellSlotScalingInvariants(
  data: unknown,
  relativePath: string,
): string[] {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return errors;
  }

  const spell = data as {
    level?: unknown;
    output?: {
      damage?: Array<{
        type?: unknown;
        slotScaling?: {
          mode?: unknown;
          startAtSlotLevel?: unknown;
          bySlotLevel?: Record<string, unknown>;
        };
      }>;
    };
  };

  const baseLevel = typeof spell.level === 'number' ? spell.level : null;
  const damageEntries = spell.output?.damage;
  if (!Array.isArray(damageEntries)) {
    return errors;
  }

  damageEntries.forEach((entry, index) => {
    const slotScaling = entry.slotScaling;
    if (!slotScaling) return;

    if (baseLevel != null && slotScaling.mode === 'linear') {
      const startAt =
        typeof slotScaling.startAtSlotLevel === 'number'
          ? slotScaling.startAtSlotLevel
          : baseLevel + 1;
      if (startAt <= baseLevel) {
        errors.push(
          `output.damage[${index}].slotScaling.startAtSlotLevel must be greater than base spell level (${baseLevel}).`,
        );
      }
    }

    if (baseLevel != null && slotScaling.mode === 'table' && slotScaling.bySlotLevel) {
      Object.keys(slotScaling.bySlotLevel).forEach((slotLevelKey) => {
        const slotLevel = Number(slotLevelKey);
        if (!Number.isInteger(slotLevel) || slotLevel < 1 || slotLevel > 9) {
          errors.push(
            `output.damage[${index}].slotScaling.bySlotLevel has invalid level key '${slotLevelKey}'.`,
          );
          return;
        }
        if (slotLevel < baseLevel) {
          errors.push(
            `output.damage[${index}].slotScaling.bySlotLevel level ${slotLevel} cannot be below base spell level (${baseLevel}).`,
          );
        }
      });
    }
  });

  return errors.map((message) => `spells/${relativePath} → ${message}`);
}

function collectJsonFilesRecursive(
  rootPath: string,
  currentPath: string = rootPath,
): JsonSourceFile[] {
  const entries = readdirSync(currentPath, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name));

  const files: JsonSourceFile[] = [];

  for (const entry of entries) {
    const entryPath = resolve(currentPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectJsonFilesRecursive(rootPath, entryPath));
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith('.json')) {
      continue;
    }

    files.push({
      filePath: entryPath,
      relativePath: relative(rootPath, entryPath).replaceAll('\\', '/'),
    });
  }

  return files;
}

// ---------------------------------------------------------------------------
// Core compilation helper
// ---------------------------------------------------------------------------

function compileFolder(
  folderName: string,
  validate: ValidateFn,
  outputFileName: string,
): void {
  const folderPath = resolve(rawDir, folderName);
  const files = collectJsonFilesRecursive(folderPath);

  let hasErrors = false;
  const compiled: unknown[] = [];

  for (const file of files) {
    let data: unknown;

    try {
      data = JSON.parse(readFileSync(file.filePath, 'utf-8'));
    } catch (err) {
      console.error(`[ERROR] Could not parse ${folderName}/${file.relativePath}: ${(err as Error).message}`);
      hasErrors = true;
      continue;
    }

    if (validate(data)) {
      if (folderName === 'spells') {
        const invariantErrors = validateSpellSlotScalingInvariants(
          data,
          file.relativePath,
        );
        if (invariantErrors.length > 0) {
          hasErrors = true;
          invariantErrors.forEach((message) => {
            console.error(`[ERROR] ${message}`);
          });
          continue;
        }
      }
      compiled.push(data);
    } else {
      hasErrors = true;
      for (const error of validate.errors ?? []) {
        const location = error.instancePath || '(root)';
        console.error(`[ERROR] ${folderName}/${file.relativePath} → ${location}: ${error.message}`);
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
compileFolder('itemCategories', validateItemCategory, 'itemCategories.json');
compileFolder('spells', validateSpell, 'spells.json');
compileFolder('feats', validateFeat, 'feats.json');
compileFolder('subclasses', validateSubclass, 'subclasses.json');
compileFolder('subraces', validateSubrace, 'subraces.json');
compileFolder('traits', validateTrait, 'traits.json');
compileFolder('actions', validateAction, 'actions.json');
console.log('Data compilation complete.\n');
