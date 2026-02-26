# @redeaglestudios/mc-test

Game test utilities for Minecraft Bedrock Edition addons.

## Features

- **Simple test registration** — clean API for writing game tests
- **Pre-built structures** — flat test arenas with optional barriers
- **Auto cleanup** — spawned entities are automatically removed after tests
- **Custom commands** — run tests in-game with `/mctest:test_all`
- **Regolith filter** — bundle test scripts into your behavior pack

## Installation

### As NPM Package

```bash
npm install @redeaglestudios/mc-test
```

### As Regolith Filter

In your `config.json`:

```json
{
  "regolith": {
    "filterDefinitions": {
      "mc_test": {
        "url": "github.com/RedEagleStudios/mc-test/mc_test",
        "version": "0.1.0"
      }
    },
    "profiles": {
      "default": {
        "filters": [
          {
            "filter": "mc_test",
            "settings": {
              "entrypoint": "./data/test/scripts/tests.ts",
              "gametestVersion": "1.0.0-beta"
            }
          }
        ]
      }
    }
  }
}
```

**Filter settings:**
- `entrypoint` — path to your test file (default: `./data/test/scripts/tests.ts`)
- `external` — array of external modules (default: `["@minecraft/server", "@minecraft/server-gametest"]`)
- `gametestVersion` — gametest module version (default: `"1.0.0-beta"`)

## Configuration

Configure the library behavior:

```ts
import { configure } from "@redeaglestudios/mc-test";

configure({
  prefix: "mytest",    // Change command/structure prefix (default: "mctest")
  commands: true       // Enable custom commands (default: true)
});
```

## Writing Tests

### Basic Test

```ts
import { registerTestPlan } from "@redeaglestudios/mc-test";

registerTestPlan({
  group: "combat",
  case: "Player deals 2 damage with fist",
  test: async (test) => {
    const player = test.spawnSimulatedPlayer({ x: 1, y: 2, z: 1 }, "test_player");
    const zombie = test.spawn("minecraft:zombie", { x: 2, y: 2, z: 1 });

    const initialHealth = zombie.getComponent("minecraft:health")!.currentValue;
    
    player.attack(zombie);
    test.succeedWhen(() => {
      const currentHealth = zombie.getComponent("minecraft:health")!.currentValue;
      test.assertLessThan(currentHealth, initialHealth, "Zombie should take damage");
    });
  }
});
```

### TestPlan API

```ts
interface TestPlan {
  group: string;              // Test group/suite name
  case: string;               // Test case description
  name?: string;              // Optional custom test name (auto-generated from case if not provided)
  structureName?: string;     // Structure to use (default: "mctest:flat_4x4")
  maxTicks?: number;          // Max test duration (default: 60 seconds)
  tag?: string[];             // Tags for filtering tests
  maxAttempt?: number;        // Max retry attempts (default: 3)
  test: (test: Test) => Promise<void>;  // Test function
}
```

### Multiple Tests

Register multiple tests at once:

```ts
registerTestPlan(
  {
    group: "items",
    case: "Diamond sword deals correct damage",
    test: async (test) => { /* ... */ }
  },
  {
    group: "items",
    case: "Bow deals ranged damage",
    tag: ["ranged", "weapons"],
    test: async (test) => { /* ... */ }
  }
);
```

### Auto Cleanup

Entities spawned with `test.spawn()` or `test.spawnWithoutBehaviors()` are **automatically removed** after the test finishes:

```ts
test: async (test) => {
  const zombie = test.spawn("minecraft:zombie", { x: 1, y: 2, z: 1 });
  const creeper = test.spawn("minecraft:creeper", { x: 2, y: 2, z: 1 });
  
  // Test logic...
  
  // No need to manually remove entities!
  // They're cleaned up automatically when test ends
}
```

## Pre-built Structures

The library provides flat test arenas:

```ts
import { Structures } from "@redeaglestudios/mc-test";

registerTestPlan({
  group: "movement",
  case: "Entity walks on flat surface",
  structureName: Structures.FLAT_8X8,  // 8x8 arena with barriers
  test: async (test) => { /* ... */ }
});
```

**Available structures:**
- `Structures.FLAT_4X4` — 4×4 flat arena with barrier walls (height: 4)
- `Structures.FLAT_4X4_NB` — 4×4 flat arena without barriers
- `Structures.FLAT_8X8` — 8×8 flat arena with barrier walls (height: 8)
- `Structures.FLAT_8X8_NB` — 8×8 flat arena without barriers

### Custom Structures

Build your own flat structures:

```ts
import { buildFlatStructure } from "@redeaglestudios/mc-test";

buildFlatStructure("mytest:custom_arena", {
  width: 16,
  depth: 16,
  height: 10,
  barrier: true  // Optional barrier walls (default: true)
});
```

## Utility Functions

### isEntityDead

Check if an entity is dead or invalid:

```ts
import { isEntityDead } from "@redeaglestudios/mc-test";

test: async (test) => {
  const zombie = test.spawn("minecraft:zombie", { x: 1, y: 2, z: 1 });
  
  // Deal damage...
  
  test.succeedWhen(() => {
    test.assert(isEntityDead(zombie), "Zombie should be dead");
  });
}
```

## Custom Commands

If `commands` is enabled (default), players can run tests in-game:

### `/mctest:test_all [tag] [teleport]`

Run all tests or filter by tag.

**Parameters:**
- `tag` (optional) — Run tests with specific tag or group (default: all)
- `teleport` (optional) — Teleport to clean space before running (default: true)

**Examples:**
```
/mctest:test_all                    # Run all tests, teleport to clean area
/mctest:test_all combat false       # Run combat tests without teleporting
/mctest:test_all weapons            # Run tests tagged "weapons"
```

### `/mctest:tp_clean`

Teleport to a clean testing area (~1000 blocks away).

```
/mctest:tp_clean
```

## TypeScript Types

The package exports TypeScript types for better IDE support:

```ts
import type { 
  ConfigOptions, 
  TestPlan, 
  StructureName 
} from "@redeaglestudios/mc-test";
```


## Example Project Structure

```
my-addon/
├── data/
│   └── test/
│       └── scripts/
│           └── tests.ts          # Your test file
├── packs/
│   └── BP/
│       ├── manifest.json
│       └── scripts/
│           └── main.ts           # Main addon script
└── config.json                   # Regolith config
```

**tests.ts:**
```ts
import { registerTestPlan, Structures } from "@redeaglestudios/mc-test";

registerTestPlan({
  group: "combat",
  case: "Zombie takes damage from player",
  structureName: Structures.FLAT_4X4,
  test: async (test) => {
    const player = test.spawnSimulatedPlayer({ x: 1, y: 2, z: 1 }, "test");
    const zombie = test.spawn("minecraft:zombie", { x: 2, y: 2, z: 1 });
    
    const health = zombie.getComponent("minecraft:health")!;
    const initialHealth = health.currentValue;
    
    player.attack(zombie);
    
    test.succeedWhen(() => {
      test.assertLessThan(
        health.currentValue, 
        initialHealth, 
        "Zombie should take damage"
      );
    });
  }
});
```

## License

MIT

## Author

RedEagleStudios
