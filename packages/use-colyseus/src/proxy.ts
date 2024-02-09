export const proxy = (target: object, path: string[]) => {
  const handler: ProxyHandler<{ [key: string]: unknown }> = {
    get(target, key) {
      // Safety check
      if (key == "__isUseColyseusProxy") return true;

      const value = target[key as string];

      // NOTE(pedr0fontoura): We just want the enumerable properties from the schema.
      // For some reason some of the keys are missing if we don't wait for Colyseus first patch.
      const keys = Object.keys(target);
      if (!keys.includes(key as string)) return value;

      if (value === null) return null;
      if (typeof value == "undefined") return;

      // At this point the accessed property is valid and we should track it
      path.push(key as string);

      if (
        typeof value === "object" &&
        !(value as { __isUseColyseusProxy: boolean }).__isUseColyseusProxy
      ) {
        target[key as string] = new Proxy(value, handler);
      }

      return target[key as string];
    },
    set(target, key, value) {
      target[key as string] = value;
      return true;
    },
  };

  return new Proxy(target, handler);
};
