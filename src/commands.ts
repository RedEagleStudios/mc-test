import { CommandPermissionLevel, CustomCommandParamType, CustomCommandStatus, system } from "@minecraft/server";
import { config } from "./config.ts";
import { testSet } from "./register.ts";

system.beforeEvents.startup.subscribe((event) => {
  if (!config.commands) return;

  event.customCommandRegistry.registerEnum(
    `${config.prefix}:test_tag`, [
    "all",
    ...Array.from(
      new Set(
        testSet.flatMap((x) => [x.group, ...(x.tag ?? [])])
      )
    )
  ])

  event.customCommandRegistry.registerCommand(
    {
      name: `${config.prefix}:test_all`,
      description: "Run all tests",
      permissionLevel: CommandPermissionLevel.Admin,
      "optionalParameters": [
        {
          name: `${config.prefix}:test_tag`,
          "type": CustomCommandParamType.Enum
        },
        {
          name: "Teleport to clean space",
          "type": CustomCommandParamType.Boolean,
        },
      ]
    },
    (origin, tag, isTeleport) => {
      system.run(() => {
        if (isTeleport != false) origin.sourceEntity?.runCommand("/tp ~1000 ~ ~1000")
        if (tag && tag != "all") origin.sourceEntity?.runCommand(`/gametest runset ${tag}`)
        else origin.sourceEntity?.runCommand("/gametest runset suite:all")
      })

      return {
        message: `Running ${testSet.length} test(s)`,
        status: CustomCommandStatus.Success,
      };
    },
  );

  event.customCommandRegistry.registerCommand(
    {
      name: `${config.prefix}:tp_clean`,
      description: "Tp to ~1000 ~",
      permissionLevel: CommandPermissionLevel.Admin
    }, (origin) => {
      system.run(() => {
        origin.sourceEntity?.runCommand("/tp ~1000 ~ ~1000")
      })

      return {
        message: `Teleporting...`,
        status: CustomCommandStatus.Success,
      };
    },
  )
});
