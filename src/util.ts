import { Entity, ItemStack, system, Vector3 } from "@minecraft/server";
import { SimulatedPlayer, Test } from "@minecraft/server-gametest";

export function isEntityDead(entity: Entity): boolean {
  return !entity.isValid || entity.getComponent("minecraft:health")!!.currentValue <= 0;
}

export function fillInventory(player: SimulatedPlayer, item: ItemStack = new ItemStack("minecraft:barrier")): void {
  const container = player.getComponent("inventory")?.container;
  if (!container) return;
  for (let i = 0; i < container.size; i++) {
    container.setItem(i, item);
  }
}

export async function measureBreakTicks(
  test: Test,
  player: SimulatedPlayer,
  blockPos: Vector3,
  maxWait = 250,
): Promise<number> {
  player.breakBlock(blockPos);
  let ticks = 0;
  while (test.getBlock(blockPos).typeId !== "minecraft:air" && ticks < maxWait) {
    await system.waitTicks(1);
    ticks++;
  }
  return ticks;
}

export function hasDroppedItem(player: SimulatedPlayer, itemTypeId: string): boolean {
  for (const item of player.dimension.getEntities({ type: "item" })) {
    if (item.getComponent("item")?.itemStack.typeId === itemTypeId) return true;
  }
  return false;
}
