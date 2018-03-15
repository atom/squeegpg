export interface IOptions {
  readonly debugging: boolean;
}

export type Options = Partial<IOptions>;

export const defaultOptions: IOptions = {
  debugging: false,
};

export function applyDefaults(options: Options): IOptions {
  return {
    debugging: options.debugging === undefined ? defaultOptions.debugging : options.debugging,
  };
}
