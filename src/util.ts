import { Entity } from "@minecraft/server";

export function isEntityDead(entity: Entity): boolean {
  return !entity.isValid || entity.getComponent("minecraft:health")!!.currentValue <= 0;
}
