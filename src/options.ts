export interface IOptions {
  readonly debugging: boolean;
  readonly lockTimeout: number;
}

export type Options = Partial<IOptions>;

export const defaultOptions: IOptions = {
  debugging: false,
  lockTimeout: 1000,
};

export function applyDefaults(options: Options): IOptions {
  return {
    debugging: options.debugging === undefined ? defaultOptions.debugging : options.debugging,
    lockTimeout: options.lockTimeout === undefined ? defaultOptions.lockTimeout : options.lockTimeout,
  };
}
