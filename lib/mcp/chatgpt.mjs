const PUBLIC_METHODS = new Set([
  "initialize",
  "ping",
  "tools/list",
  "prompts/list",
  "prompts/get",
  "resources/list",
  "resources/read",
  "resources/templates/list",
]);

export function messageMethods(body) {
  const messages = Array.isArray(body) ? body : [body];
  return messages.map((message) => message?.method).filter((method) => typeof method === "string");
}

export function allowsAnonymous(body) {
  const methods = messageMethods(body);
  if (!methods.length) return false;
  return methods.every((method) => PUBLIC_METHODS.has(method) || method.startsWith("notifications/"));
}

function walkSchema(node) {
  if (!node || typeof node !== "object") return;
  if (node.exclusiveMinimum != null) {
    const floor = Number(node.exclusiveMinimum);
    delete node.exclusiveMinimum;
    if (!Number.isFinite(Number(node.minimum)) || Number(node.minimum) <= floor) node.minimum = floor;
  }
  if (node.exclusiveMaximum != null) {
    const ceiling = Number(node.exclusiveMaximum);
    delete node.exclusiveMaximum;
    if (!Number.isFinite(Number(node.maximum)) || Number(node.maximum) >= ceiling) node.maximum = ceiling;
  }
  delete node.$schema;
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(walkSchema);
    else walkSchema(value);
  }
}

export function prepareForChatGpt(payload) {
  const tools = payload?.result?.tools;
  if (!Array.isArray(tools)) return payload;
  for (const tool of tools) {
    tool.securitySchemes = [{ type: "oauth2", scopes: ["payollar"] }];
    delete tool.execution;
    if (tool.inputSchema) {
      walkSchema(tool.inputSchema);
      tool.inputSchema.type = "object";
      tool.inputSchema.additionalProperties = false;
      tool.inputSchema.properties ||= {};
    }
    if (tool.outputSchema) {
      walkSchema(tool.outputSchema);
      tool.outputSchema.additionalProperties = false;
    }
  }
  return payload;
}
