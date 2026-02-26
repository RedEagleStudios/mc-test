export interface ConfigOptions {
  prefix?: string;
  commands?: boolean;
}

export const config = {
  prefix: "mctest",
  commands: true,
};

export function configure(options: ConfigOptions): void {
  if (options.prefix !== undefined) config.prefix = options.prefix;
  if (options.commands !== undefined) config.commands = options.commands;
}
