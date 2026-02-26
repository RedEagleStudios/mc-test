import { BlockPermutation, StructureSaveMode, world } from "@minecraft/server";
import { config } from "./config.ts";

interface StructureConfig {
  readonly width: number;
  readonly depth: number;
  readonly height: number;
  readonly barrier?: boolean;
}

export const Structures = {
  get FLAT_4X4() { return `${config.prefix}:flat_4x4`; },
  get FLAT_4X4_NB() { return `${config.prefix}:flat_4x4_nb`; },
  get FLAT_8X8() { return `${config.prefix}:flat_8x8`; },
  get FLAT_8X8_NB() { return `${config.prefix}:flat_8x8_nb`; },
};

export type StructureName = string;

const structureConfigs: Record<string, StructureConfig> = {
  flat_4x4: { width: 4, depth: 4, height: 4 },
  flat_4x4_nb: { width: 4, depth: 4, height: 4, barrier: false },
  flat_8x8: { width: 8, depth: 8, height: 8 },
  flat_8x8_nb: { width: 8, depth: 8, height: 8, barrier: false },
};

export function buildFlatStructure(name: string, { width, depth, height, barrier = true }: StructureConfig): void {
  if (world.structureManager.get(name)) return;

  const structureSize = barrier
    ? { x: width + 2, y: height, z: depth + 2 }
    : { x: width, y: height, z: depth };
  const structure = world.structureManager.createEmpty(name, structureSize, StructureSaveMode.Memory);
  const smoothStone = BlockPermutation.resolve("minecraft:smooth_stone");

  const offset = barrier ? 1 : 0;
  for (let x = offset; x < width + offset; x++) {
    for (let z = offset; z < depth + offset; z++) {
      structure.setBlockPermutation({ x, y: 0, z }, smoothStone);
    }
  }

  if (barrier) {
    const barrierBlock = BlockPermutation.resolve("minecraft:barrier");
    for (let y = 0; y < height; y++) {
      for (let x = 0; x <= width + 1; x++) {
        structure.setBlockPermutation({ x, y, z: 0 }, barrierBlock);
        structure.setBlockPermutation({ x, y, z: depth + 1 }, barrierBlock);
      }
      for (let z = 1; z <= depth; z++) {
        structure.setBlockPermutation({ x: 0, y, z }, barrierBlock);
        structure.setBlockPermutation({ x: width + 1, y, z }, barrierBlock);
      }
    }
  }

  structure.saveToWorld();
}

world.afterEvents.worldLoad.subscribe(() => {
  for (const [suffix, cfg] of Object.entries(structureConfigs)) {
    buildFlatStructure(`${config.prefix}:${suffix}`, cfg);
  }
});
