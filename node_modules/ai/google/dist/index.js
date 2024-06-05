"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// google/index.ts
var google_exports = {};
__export(google_exports, {
  Google: () => Google,
  google: () => google
});
module.exports = __toCommonJS(google_exports);

// spec/errors/api-call-error.ts
var APICallError = class extends Error {
  constructor({
    message,
    url,
    requestBodyValues,
    statusCode,
    responseBody,
    cause,
    isRetryable = statusCode != null && (statusCode === 408 || // request timeout
    statusCode === 409 || // conflict
    statusCode === 429 || // too many requests
    statusCode >= 500),
    // server error
    data
  }) {
    super(message);
    this.name = "AI_APICallError";
    this.url = url;
    this.requestBodyValues = requestBodyValues;
    this.statusCode = statusCode;
    this.responseBody = responseBody;
    this.cause = cause;
    this.isRetryable = isRetryable;
    this.data = data;
  }
  static isAPICallError(error) {
    return error instanceof Error && error.name === "AI_APICallError" && typeof error.url === "string" && typeof error.requestBodyValues === "object" && (error.statusCode == null || typeof error.statusCode === "number") && (error.responseBody == null || typeof error.responseBody === "string") && (error.cause == null || typeof error.cause === "object") && typeof error.isRetryable === "boolean" && (error.data == null || typeof error.data === "object");
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      url: this.url,
      requestBodyValues: this.requestBodyValues,
      statusCode: this.statusCode,
      responseBody: this.responseBody,
      cause: this.cause,
      isRetryable: this.isRetryable,
      data: this.data
    };
  }
};

// spec/util/generate-id.ts
var import_non_secure = require("nanoid/non-secure");
var generateId = (0, import_non_secure.customAlphabet)(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7
);

// spec/util/get-error-message.ts
function getErrorMessage(error) {
  if (error == null) {
    return "unknown error";
  }
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return JSON.stringify(error);
}

// spec/errors/load-api-key-error.ts
var LoadAPIKeyError = class extends Error {
  constructor({ message }) {
    super(message);
    this.name = "AI_LoadAPIKeyError";
  }
  static isLoadAPIKeyError(error) {
    return error instanceof Error && error.name === "AI_LoadAPIKeyError";
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message
    };
  }
};

// spec/util/load-api-key.ts
function loadApiKey({
  apiKey,
  environmentVariableName,
  apiKeyParameterName = "apiKey",
  description
}) {
  if (typeof apiKey === "string") {
    return apiKey;
  }
  if (apiKey != null) {
    throw new LoadAPIKeyError({
      message: `${description} API key must be a string.`
    });
  }
  if (typeof process === "undefined") {
    throw new LoadAPIKeyError({
      message: `${description} API key is missing. Pass it using the '${apiKeyParameterName}' parameter. Environment variables is not supported in this environment.`
    });
  }
  apiKey = process.env[environmentVariableName];
  if (apiKey == null) {
    throw new LoadAPIKeyError({
      message: `${description} API key is missing. Pass it using the '${apiKeyParameterName}' parameter or the ${environmentVariableName} environment variable.`
    });
  }
  if (typeof apiKey !== "string") {
    throw new LoadAPIKeyError({
      message: `${description} API key must be a string. The value of the ${environmentVariableName} environment variable is not a string.`
    });
  }
  return apiKey;
}

// spec/util/parse-json.ts
var import_secure_json_parse = __toESM(require("secure-json-parse"));

// spec/errors/json-parse-error.ts
var JSONParseError = class extends Error {
  constructor({ text, cause }) {
    super(
      `JSON parsing failed: Text: ${text}.
Error message: ${getErrorMessage(cause)}`
    );
    this.name = "AI_JSONParseError";
    this.cause = cause;
    this.text = text;
  }
  static isJSONParseError(error) {
    return error instanceof Error && error.name === "AI_JSONParseError" && typeof error.text === "string" && typeof error.cause === "string";
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      cause: this.cause,
      stack: this.stack,
      valueText: this.text
    };
  }
};

// spec/errors/type-validation-error.ts
var TypeValidationError = class extends Error {
  constructor({ value, cause }) {
    super(
      `Type validation failed: Value: ${JSON.stringify(value)}.
Error message: ${getErrorMessage(cause)}`
    );
    this.name = "AI_TypeValidationError";
    this.cause = cause;
    this.value = value;
  }
  static isTypeValidationError(error) {
    return error instanceof Error && error.name === "AI_TypeValidationError" && typeof error.value === "string" && typeof error.cause === "string";
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      cause: this.cause,
      stack: this.stack,
      value: this.value
    };
  }
};

// spec/util/validate-types.ts
function validateTypes({
  value,
  schema
}) {
  try {
    return schema.parse(value);
  } catch (error) {
    throw new TypeValidationError({ value, cause: error });
  }
}
function safeValidateTypes({
  value,
  schema
}) {
  try {
    const validationResult = schema.safeParse(value);
    if (validationResult.success) {
      return {
        success: true,
        value: validationResult.data
      };
    }
    return {
      success: false,
      error: new TypeValidationError({
        value,
        cause: validationResult.error
      })
    };
  } catch (error) {
    return {
      success: false,
      error: TypeValidationError.isTypeValidationError(error) ? error : new TypeValidationError({ value, cause: error })
    };
  }
}

// spec/util/parse-json.ts
function parseJSON({
  text,
  schema
}) {
  try {
    const value = import_secure_json_parse.default.parse(text);
    if (schema == null) {
      return value;
    }
    return validateTypes({ value, schema });
  } catch (error) {
    if (JSONParseError.isJSONParseError(error) || TypeValidationError.isTypeValidationError(error)) {
      throw error;
    }
    throw new JSONParseError({ text, cause: error });
  }
}
function safeParseJSON({
  text,
  schema
}) {
  try {
    const value = import_secure_json_parse.default.parse(text);
    if (schema == null) {
      return {
        success: true,
        value
      };
    }
    return safeValidateTypes({ value, schema });
  } catch (error) {
    return {
      success: false,
      error: JSONParseError.isJSONParseError(error) ? error : new JSONParseError({ text, cause: error })
    };
  }
}

// spec/util/post-to-api.ts
var postJsonToApi = async ({
  url,
  headers,
  body,
  failedResponseHandler,
  successfulResponseHandler,
  abortSignal
}) => postToApi({
  url,
  headers: {
    ...headers,
    "Content-Type": "application/json"
  },
  body: {
    content: JSON.stringify(body),
    values: body
  },
  failedResponseHandler,
  successfulResponseHandler,
  abortSignal
});
var postToApi = async ({
  url,
  headers = {},
  body,
  successfulResponseHandler,
  failedResponseHandler,
  abortSignal
}) => {
  try {
    const definedHeaders = Object.fromEntries(
      Object.entries(headers).filter(([_key, value]) => value != null)
    );
    const response = await fetch(url, {
      method: "POST",
      headers: definedHeaders,
      body: body.content,
      signal: abortSignal
    });
    if (!response.ok) {
      try {
        throw await failedResponseHandler({
          response,
          url,
          requestBodyValues: body.values
        });
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "AbortError" || APICallError.isAPICallError(error)) {
            throw error;
          }
        }
        throw new APICallError({
          message: "Failed to process error response",
          cause: error,
          statusCode: response.status,
          url,
          requestBodyValues: body.values
        });
      }
    }
    try {
      return await successfulResponseHandler({
        response,
        url,
        requestBodyValues: body.values
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError" || APICallError.isAPICallError(error)) {
          throw error;
        }
      }
      throw new APICallError({
        message: "Failed to process successful response",
        cause: error,
        statusCode: response.status,
        url,
        requestBodyValues: body.values
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw error;
      }
    }
    if (error instanceof TypeError && error.message === "fetch failed") {
      const cause = error.cause;
      if (cause != null) {
        throw new APICallError({
          message: `Cannot connect to API: ${cause.message}`,
          cause,
          url,
          requestBodyValues: body.values,
          isRetryable: true
          // retry when network error
        });
      }
    }
    throw error;
  }
};

// spec/util/response-handler.ts
var import_stream = require("eventsource-parser/stream");

// spec/errors/no-response-body-error.ts
var NoResponseBodyError = class extends Error {
  constructor({ message = "No response body" } = {}) {
    super(message);
    this.name = "AI_NoResponseBodyError";
  }
  static isNoResponseBodyError(error) {
    return error instanceof Error && error.name === "AI_NoResponseBodyError";
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      stack: this.stack
    };
  }
};

// spec/util/response-handler.ts
var createJsonErrorResponseHandler = ({
  errorSchema,
  errorToMessage,
  isRetryable
}) => async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();
  if (responseBody.trim() === "") {
    return new APICallError({
      message: response.statusText,
      url,
      requestBodyValues,
      statusCode: response.status,
      responseBody,
      isRetryable: isRetryable == null ? void 0 : isRetryable(response)
    });
  }
  try {
    const parsedError = parseJSON({
      text: responseBody,
      schema: errorSchema
    });
    return new APICallError({
      message: errorToMessage(parsedError),
      url,
      requestBodyValues,
      statusCode: response.status,
      responseBody,
      data: parsedError,
      isRetryable: isRetryable == null ? void 0 : isRetryable(response, parsedError)
    });
  } catch (parseError) {
    return new APICallError({
      message: response.statusText,
      url,
      requestBodyValues,
      statusCode: response.status,
      responseBody,
      isRetryable: isRetryable == null ? void 0 : isRetryable(response)
    });
  }
};
var createEventSourceResponseHandler = (chunkSchema2) => async ({ response }) => {
  if (response.body == null) {
    throw new NoResponseBodyError();
  }
  return response.body.pipeThrough(new TextDecoderStream()).pipeThrough(new import_stream.EventSourceParserStream()).pipeThrough(
    new TransformStream({
      transform({ data }, controller) {
        if (data === "[DONE]") {
          return;
        }
        controller.enqueue(
          safeParseJSON({
            text: data,
            schema: chunkSchema2
          })
        );
      }
    })
  );
};
var createJsonResponseHandler = (responseSchema2) => async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();
  const parsedResult = safeParseJSON({
    text: responseBody,
    schema: responseSchema2
  });
  if (!parsedResult.success) {
    throw new APICallError({
      message: "Invalid JSON response",
      cause: parsedResult.error,
      statusCode: response.status,
      responseBody,
      url,
      requestBodyValues
    });
  }
  return parsedResult.value;
};

// spec/util/uint8-utils.ts
function convertUint8ArrayToBase64(array) {
  let latin1string = "";
  for (let i = 0; i < array.length; i++) {
    latin1string += String.fromCodePoint(array[i]);
  }
  return globalThis.btoa(latin1string);
}

// spec/errors/unsupported-functionality-error.ts
var UnsupportedFunctionalityError = class extends Error {
  constructor({
    provider,
    functionality
  }) {
    super(
      `'${functionality}' functionality not supported by the '${provider}' provider.`
    );
    this.name = "AI_UnsupportedFunctionalityError";
    this.provider = provider;
    this.functionality = functionality;
  }
  static isUnsupportedFunctionalityError(error) {
    return error instanceof Error && error.name === "AI_UnsupportedFunctionalityError" && typeof error.provider === "string" && typeof error.functionality === "string";
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      stack: this.stack,
      provider: this.provider,
      functionality: this.functionality
    };
  }
};

// google/google-generative-ai-language-model.ts
var import_zod2 = require("zod");

// google/convert-to-google-generative-ai-messages.ts
function convertToGoogleGenerativeAIMessages({
  prompt,
  provider
}) {
  const messages = [];
  for (const { role, content } of prompt) {
    switch (role) {
      case "system": {
        messages.push({ role: "user", parts: [{ text: content }] });
        messages.push({ role: "model", parts: [{ text: "" }] });
        break;
      }
      case "user": {
        messages.push({
          role: "user",
          parts: content.map((part) => {
            var _a;
            switch (part.type) {
              case "text": {
                return { text: part.text };
              }
              case "image": {
                if (part.image instanceof URL) {
                  throw new UnsupportedFunctionalityError({
                    provider,
                    functionality: "URL image parts"
                  });
                } else {
                  return {
                    inlineData: {
                      mimeType: (_a = part.mimeType) != null ? _a : "image/jpeg",
                      data: convertUint8ArrayToBase64(part.image)
                    }
                  };
                }
              }
            }
          })
        });
        break;
      }
      case "assistant": {
        messages.push({
          role: "model",
          parts: content.map((part) => {
            switch (part.type) {
              case "text": {
                return part.text.length === 0 ? void 0 : { text: part.text };
              }
              case "tool-call": {
                return {
                  functionCall: {
                    name: part.toolName,
                    args: part.args
                  }
                };
              }
            }
          }).filter(
            (part) => part !== void 0
          )
        });
        break;
      }
      case "tool": {
        messages.push({
          role: "user",
          parts: content.map((part) => ({
            functionResponse: {
              name: part.toolName,
              response: part.result
            }
          }))
        });
        break;
      }
      default: {
        const _exhaustiveCheck = role;
        throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
      }
    }
  }
  return messages;
}

// google/google-error.ts
var import_zod = require("zod");
var googleErrorDataSchema = import_zod.z.object({
  error: import_zod.z.object({
    code: import_zod.z.number().nullable(),
    message: import_zod.z.string(),
    status: import_zod.z.string()
  })
});
var googleFailedResponseHandler = createJsonErrorResponseHandler({
  errorSchema: googleErrorDataSchema,
  errorToMessage: (data) => data.error.message
});

// google/map-google-generative-ai-finish-reason.ts
function mapGoogleGenerativeAIFinishReason(finishReason) {
  switch (finishReason) {
    case "STOP":
      return "stop";
    case "MAX_TOKENS":
      return "length";
    case "RECITATION":
    case "SAFETY":
      return "content-filter";
    case "FINISH_REASON_UNSPECIFIED":
    case "OTHER":
    default:
      return "other";
  }
}

// google/google-generative-ai-language-model.ts
var GoogleGenerativeAILanguageModel = class {
  constructor(modelId, settings, config) {
    this.specificationVersion = "v1";
    this.defaultObjectGenerationMode = void 0;
    this.modelId = modelId;
    this.settings = settings;
    this.config = config;
  }
  get provider() {
    return this.config.provider;
  }
  getArgs({
    mode,
    prompt,
    maxTokens,
    temperature,
    topP,
    frequencyPenalty,
    presencePenalty,
    seed
  }) {
    var _a;
    const type = mode.type;
    const warnings = [];
    if (frequencyPenalty != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "frequencyPenalty"
      });
    }
    if (presencePenalty != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "presencePenalty"
      });
    }
    if (seed != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "seed"
      });
    }
    const baseArgs = {
      generationConfig: {
        // model specific settings:
        topK: this.settings.topK,
        // standardized settings:
        maxOutputTokens: maxTokens,
        temperature,
        topP
      },
      // prompt:
      contents: convertToGoogleGenerativeAIMessages({
        provider: this.provider,
        prompt
      })
    };
    switch (type) {
      case "regular": {
        const functionDeclarations = (_a = mode.tools) == null ? void 0 : _a.map((tool) => {
          var _a2;
          return {
            name: tool.name,
            description: (_a2 = tool.description) != null ? _a2 : "",
            parameters: prepareJsonSchema(tool.parameters)
          };
        });
        return {
          args: {
            ...baseArgs,
            tools: functionDeclarations == null ? void 0 : { functionDeclarations }
          },
          warnings
        };
      }
      case "object-json": {
        throw new UnsupportedFunctionalityError({
          functionality: "object-json mode",
          provider: this.provider
        });
      }
      case "object-tool": {
        throw new UnsupportedFunctionalityError({
          functionality: "object-tool mode",
          provider: this.provider
        });
      }
      case "object-grammar": {
        throw new UnsupportedFunctionalityError({
          functionality: "object-grammar mode",
          provider: this.provider
        });
      }
      default: {
        const _exhaustiveCheck = type;
        throw new Error(`Unsupported type: ${_exhaustiveCheck}`);
      }
    }
  }
  async doGenerate(options) {
    var _a;
    const { args, warnings } = this.getArgs(options);
    const response = await postJsonToApi({
      url: `${this.config.baseUrl}/${this.modelId}:generateContent`,
      headers: this.config.headers(),
      body: args,
      failedResponseHandler: googleFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(responseSchema),
      abortSignal: options.abortSignal
    });
    const { contents: rawPrompt, ...rawSettings } = args;
    const candidate = response.candidates[0];
    return {
      text: getTextFromParts(candidate.content.parts),
      toolCalls: getToolCallsFromParts({
        parts: candidate.content.parts,
        generateId: this.config.generateId
      }),
      finishReason: mapGoogleGenerativeAIFinishReason(candidate.finishReason),
      usage: {
        promptTokens: NaN,
        completionTokens: (_a = candidate.tokenCount) != null ? _a : NaN
      },
      rawCall: { rawPrompt, rawSettings },
      warnings
    };
  }
  async doStream(options) {
    const { args, warnings } = this.getArgs(options);
    const response = await postJsonToApi({
      url: `${this.config.baseUrl}/${this.modelId}:streamGenerateContent?alt=sse`,
      headers: this.config.headers(),
      body: args,
      failedResponseHandler: googleFailedResponseHandler,
      successfulResponseHandler: createEventSourceResponseHandler(chunkSchema),
      abortSignal: options.abortSignal
    });
    const { contents: rawPrompt, ...rawSettings } = args;
    let finishReason = "other";
    let usage = {
      promptTokens: Number.NaN,
      completionTokens: Number.NaN
    };
    const generateId2 = this.config.generateId;
    return {
      stream: response.pipeThrough(
        new TransformStream({
          transform(chunk, controller) {
            if (!chunk.success) {
              controller.enqueue({ type: "error", error: chunk.error });
              return;
            }
            const value = chunk.value;
            const candidate = value.candidates[0];
            if ((candidate == null ? void 0 : candidate.finishReason) != null) {
              finishReason = mapGoogleGenerativeAIFinishReason(
                candidate.finishReason
              );
            }
            if (candidate.tokenCount != null) {
              usage = {
                promptTokens: NaN,
                completionTokens: candidate.tokenCount
              };
            }
            const deltaText = getTextFromParts(candidate.content.parts);
            if (deltaText != null) {
              controller.enqueue({
                type: "text-delta",
                textDelta: deltaText
              });
            }
            const toolCallDeltas = getToolCallsFromParts({
              parts: candidate.content.parts,
              generateId: generateId2
            });
            if (toolCallDeltas != null) {
              for (const toolCall of toolCallDeltas) {
                controller.enqueue({
                  type: "tool-call-delta",
                  toolCallType: "function",
                  toolCallId: toolCall.toolCallId,
                  toolName: toolCall.toolName,
                  argsTextDelta: toolCall.args
                });
                controller.enqueue({
                  type: "tool-call",
                  toolCallType: "function",
                  toolCallId: toolCall.toolCallId,
                  toolName: toolCall.toolName,
                  args: toolCall.args
                });
              }
            }
          },
          flush(controller) {
            controller.enqueue({ type: "finish", finishReason, usage });
          }
        })
      ),
      rawCall: { rawPrompt, rawSettings },
      warnings
    };
  }
};
function prepareJsonSchema(jsonSchema) {
  if (typeof jsonSchema !== "object") {
    return jsonSchema;
  }
  if (Array.isArray(jsonSchema)) {
    return jsonSchema.map(prepareJsonSchema);
  }
  const result = {};
  for (const [key, value] of Object.entries(jsonSchema)) {
    if (key === "additionalProperties" || key === "$schema") {
      continue;
    }
    result[key] = prepareJsonSchema(value);
  }
  return result;
}
function getToolCallsFromParts({
  parts,
  generateId: generateId2
}) {
  const functionCallParts = parts.filter(
    (part) => "functionCall" in part
  );
  return functionCallParts.length === 0 ? void 0 : functionCallParts.map((part) => ({
    toolCallType: "function",
    toolCallId: generateId2(),
    toolName: part.functionCall.name,
    args: JSON.stringify(part.functionCall.args)
  }));
}
function getTextFromParts(parts) {
  const textParts = parts.filter((part) => "text" in part);
  return textParts.length === 0 ? void 0 : textParts.map((part) => part.text).join("");
}
var contentSchema = import_zod2.z.object({
  role: import_zod2.z.string(),
  parts: import_zod2.z.array(
    import_zod2.z.union([
      import_zod2.z.object({
        text: import_zod2.z.string()
      }),
      import_zod2.z.object({
        functionCall: import_zod2.z.object({
          name: import_zod2.z.string(),
          args: import_zod2.z.unknown()
        })
      })
    ])
  )
});
var candidateSchema = import_zod2.z.object({
  content: contentSchema,
  finishReason: import_zod2.z.string().optional(),
  tokenCount: import_zod2.z.number().optional()
});
var responseSchema = import_zod2.z.object({
  candidates: import_zod2.z.array(candidateSchema)
});
var chunkSchema = import_zod2.z.object({
  candidates: import_zod2.z.array(candidateSchema)
});

// google/google-facade.ts
var Google = class {
  constructor(options = {}) {
    var _a;
    this.baseUrl = options.baseUrl;
    this.apiKey = options.apiKey;
    this.generateId = (_a = options.generateId) != null ? _a : generateId;
  }
  get baseConfig() {
    var _a;
    return {
      baseUrl: (_a = this.baseUrl) != null ? _a : "https://generativelanguage.googleapis.com/v1beta",
      headers: () => ({
        "x-goog-api-key": loadApiKey({
          apiKey: this.apiKey,
          environmentVariableName: "GOOGLE_GENERATIVE_AI_API_KEY",
          description: "Google Generative AI"
        })
      })
    };
  }
  generativeAI(modelId, settings = {}) {
    return new GoogleGenerativeAILanguageModel(modelId, settings, {
      provider: "google.generative-ai",
      ...this.baseConfig,
      generateId: this.generateId
    });
  }
};
var google = new Google();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Google,
  google
});
//# sourceMappingURL=index.js.map