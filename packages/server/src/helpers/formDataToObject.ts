import type { ObjectSchema } from "valibot";

export function formDataToObject(
  formData: FormData,
  input?: ObjectSchema<any>
) {
  if (!input) {
    return Object.fromEntries(formData.entries());
  }
  const result: Record<string, unknown> = {};
  for (const key of formData.keys()) {
    const target = input.object[key].schema === "array" ? "getAll" : "get";
    result[key] = formData[target](key);
  }
  return result;
}
