export function formDataToObject(formData: FormData, input?: any) {
  if (!input) {
    return Object.fromEntries(formData.entries());
  }
  const result: Record<string, unknown> = {};
  for (const key of formData.keys()) {
    const target =
      input?.object?.[key]?.schema === "array" ||
      input?.shape?.[key]?._def?.typeName === "ZodArray"
        ? "getAll"
        : "get";
    result[key] = formData[target](key);
  }
  return result;
}
