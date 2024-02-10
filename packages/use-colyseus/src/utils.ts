import { Schema, MapSchema, ArraySchema, SetSchema } from "@colyseus/schema";

export const isSchema = (value: unknown): value is Schema => {
  if (
    value &&
    typeof value === "object" &&
    "_definition" in value &&
    value._definition &&
    typeof value._definition === "object" &&
    "schema" in value._definition
  ) {
    return true;
  }

  return false;
};

export const isArraySchema = (value: unknown): value is ArraySchema => {
  if (
    value &&
    typeof value === "object" &&
    "clone" in value &&
    "push" in value &&
    "toArray" in value
  ) {
    return true;
  }

  return false;
};

export const isSetSchema = (value: unknown): value is SetSchema => {
  if (
    value &&
    typeof value === "object" &&
    "clone" in value &&
    "add" in value &&
    "toArray" in value
  ) {
    return true;
  }

  return false;
};

export const isMapSchema = (value: unknown): value is MapSchema => {
  if (
    value &&
    typeof value === "object" &&
    "clone" in value &&
    "set" in value &&
    "has" in value
  ) {
    return true;
  }

  return false;
};

export const isItemCollection = (value: unknown): boolean => {
  return isArraySchema(value) || isSetSchema(value) || isMapSchema(value);
};
