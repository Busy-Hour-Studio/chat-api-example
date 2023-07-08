declare global {
  type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type AnyRecord = Record<any, any>;

  type UnknownObject = NonNullable<unknown>;

  type KeyOf<T> = keyof T;
  type ValueOf<T> = T[keyof T];
}

export {};
