import { Entity, TicksPerSecond, Vector3 } from "@minecraft/server";
import { registerAsync, Test } from "@minecraft/server-gametest";
import { Structures } from "./structures.ts";

export type TestPlan = {
  group: string;
  name?: string;
  case: string;
  structureName?: string;
  maxTicks?: number;
  tag?: string[]
  maxAttempt?: number,
  test: (test: Test) => Promise<void>;
};


export const testSet: TestPlan[] = [];

export function registerTestPlan(...plans: TestPlan[]): void {
  for (const plan of plans) {
    testSet.push(plan);

    let builder = registerAsync(
      plan.group,
      plan.name ??
      plan.case
        .toLowerCase()
        .replace(/[^a-z0-9_ ]/g, "")
        .replaceAll(" ", "_"),
      async (test) => {
        test.print(plan.case);

        const entityToCleanUp: Entity[] = [];
        const originalSpawn = test.spawn.bind(test);
        test.spawn = (entityTypeIdentifier: string, blockLocation: Vector3): Entity => {
          const entity = originalSpawn(entityTypeIdentifier, blockLocation);
          entityToCleanUp.push(entity);
          return entity;
        };

        const originalSpawnWithoutBehavior = test.spawnWithoutBehaviors.bind(test);
        test.spawnWithoutBehaviors = (entityTypeIdentifier: string, blockLocation: Vector3): Entity => {
          const entity = originalSpawnWithoutBehavior(entityTypeIdentifier, blockLocation);
          entityToCleanUp.push(entity);
          return entity;
        };

        test.runOnFinish(() => {
          for (const entity of entityToCleanUp) {
            if (entity.isValid) entity.remove();
          }
        })

        try {
          await plan.test(test);
        } catch (e: any) {
          console.error(e)
          test.fail(e.message)
        } finally {
          test.killAllEntities();
        }
      }).tag(plan.group);
    for (const tag of plan.tag ?? []) {
      builder = builder.tag(tag)
    }

    builder = builder.maxAttempts(plan.maxAttempt ?? 3)

    const structureName = plan.structureName ?? Structures.FLAT_4X4
    builder?.structureName(structureName).maxTicks(plan.maxTicks ?? TicksPerSecond * 60);
  }
}
