export function validateSchema(schema, data) {
  return schema.parse(data);
}
