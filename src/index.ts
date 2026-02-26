export { configure } from "./config.ts";
export type { ConfigOptions } from "./config.ts";
export { registerTestPlan } from "./register.ts";
export type { TestPlan } from "./register.ts";
export { Structures, buildFlatStructure } from "./structures.ts";
export type { StructureName } from "./structures.ts";
export { isEntityDead } from "./util.ts";

import "./structures.ts";
import "./commands.ts";
