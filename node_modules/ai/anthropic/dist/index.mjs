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
import SecureJSON from "secure-json-parse";

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
    const value = SecureJSON.parse(text);
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
    const value = SecureJSON.parse(text);
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
import {
  EventSourceParserStream
} from "eventsource-parser/stream";

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
var createEventSourceResponseHandler = (chunkSchema) => async ({ response }) => {
  if (response.body == null) {
    throw new NoResponseBodyError();
  }
  return response.body.pipeThrough(new TextDecoderStream()).pipeThrough(new EventSourceParserStream()).pipeThrough(
    new TransformStream({
      transform({ data }, controller) {
        if (data === "[DONE]") {
          return;
        }
        controller.enqueue(
          safeParseJSON({
            text: data,
            schema: chunkSchema
          })
        );
      }
    })
  );
};
var createJsonResponseHandler = (responseSchema) => async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();
  const parsedResult = safeParseJSON({
    text: responseBody,
    schema: responseSchema
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

// anthropic/anthropic-messages-language-model.ts
import { z as z2 } from "zod";

// anthropic/anthropic-error.ts
import { z } from "zod";
var anthropicErrorDataSchema = z.object({
  type: z.literal("error"),
  error: z.object({
    type: z.string(),
    message: z.string()
  })
});
var anthropicFailedResponseHandler = createJsonErrorResponseHandler({
  errorSchema: anthropicErrorDataSchema,
  errorToMessage: (data) => data.error.message
});

// anthropic/convert-to-anthropic-messages-prompt.ts
function convertToAnthropicMessagesPrompt({
  prompt,
  provider
}) {
  let system;
  const messages = [];
  for (const { role, content } of prompt) {
    switch (role) {
      case "system": {
        system = content;
        break;
      }
      case "user": {
        messages.push({
          role: "user",
          content: content.map((part) => {
            var _a;
            switch (part.type) {
              case "text": {
                return { type: "text", text: part.text };
              }
              case "image": {
                if (part.image instanceof URL) {
                  throw new UnsupportedFunctionalityError({
                    provider,
                    functionality: "URL image parts"
                  });
                } else {
                  return {
                    type: "image",
                    source: {
                      type: "base64",
                      media_type: (_a = part.mimeType) != null ? _a : "image/jpeg",
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
          role: "assistant",
          content: content.map((part) => {
            switch (part.type) {
              case "text": {
                return { type: "text", text: part.text };
              }
              case "tool-call": {
                return {
                  type: "tool_use",
                  id: part.toolCallId,
                  name: part.toolName,
                  input: part.args
                };
              }
            }
          })
        });
        break;
      }
      case "tool": {
        messages.push({
          role: "user",
          content: content.map((part) => ({
            type: "tool_result",
            tool_use_id: part.toolCallId,
            content: JSON.stringify(part.result)
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
  return {
    system,
    messages
  };
}

// anthropic/map-anthropic-stop-reason.ts
function mapAnthropicStopReason(finishReason) {
  switch (finishReason) {
    case "end_turn":
    case "stop_sequence":
      return "stop";
    case "tool_use":
      return "tool-calls";
    case "max_tokens":
      return "length";
    default:
      return "other";
  }
}

// anthropic/anthropic-messages-language-model.ts
var AnthropicMessagesLanguageModel = class {
  constructor(modelId, settings, config) {
    this.specificationVersion = "v1";
    this.defaultObjectGenerationMode = "tool";
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
    const messagesPrompt = convertToAnthropicMessagesPrompt({
      provider: this.provider,
      prompt
    });
    const baseArgs = {
      // model id:
      model: this.modelId,
      // model specific settings:
      top_k: this.settings.topK,
      // standardized settings:
      max_tokens: maxTokens != null ? maxTokens : 4096,
      // 4096: max model output tokens
      temperature,
      // uses 0..1 scale
      top_p: topP,
      // prompt:
      system: messagesPrompt.system,
      messages: messagesPrompt.messages
    };
    switch (type) {
      case "regular": {
        const tools = ((_a = mode.tools) == null ? void 0 : _a.length) ? mode.tools : void 0;
        return {
          args: {
            ...baseArgs,
            tools: tools == null ? void 0 : tools.map((tool) => ({
              name: tool.name,
              description: tool.description,
              input_schema: tool.parameters
            }))
          },
          warnings
        };
      }
      case "object-json": {
        throw new UnsupportedFunctionalityError({
          functionality: "json-mode object generation",
          provider: this.provider
        });
      }
      case "object-tool": {
        return {
          args: {
            ...baseArgs,
            tools: [
              {
                name: mode.tool.name,
                description: mode.tool.description,
                input_schema: mode.tool.parameters
              }
            ]
          },
          warnings
        };
      }
      case "object-grammar": {
        throw new UnsupportedFunctionalityError({
          functionality: "grammar-mode object generation",
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
    const { args, warnings } = this.getArgs(options);
    const response = await postJsonToApi({
      url: `${this.config.baseUrl}/messages`,
      headers: this.config.headers(),
      body: args,
      failedResponseHandler: anthropicFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        anthropicMessagesResponseSchema
      ),
      abortSignal: options.abortSignal
    });
    const { messages: rawPrompt, ...rawSettings } = args;
    let text = "";
    for (const content of response.content) {
      if (content.type === "text") {
        text += content.text;
      }
    }
    let toolCalls = void 0;
    if (response.content.some((content) => content.type === "tool_use")) {
      toolCalls = [];
      for (const content of response.content) {
        if (content.type === "tool_use") {
          toolCalls.push({
            toolCallType: "function",
            toolCallId: content.id,
            toolName: content.name,
            args: JSON.stringify(content.input)
          });
        }
      }
    }
    return {
      text,
      toolCalls,
      finishReason: mapAnthropicStopReason(response.stop_reason),
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens
      },
      rawCall: { rawPrompt, rawSettings },
      warnings
    };
  }
  async doStream(options) {
    const { args, warnings } = this.getArgs(options);
    const response = await postJsonToApi({
      url: `${this.config.baseUrl}/messages`,
      headers: this.config.headers(),
      body: {
        ...args,
        stream: true
      },
      failedResponseHandler: anthropicFailedResponseHandler,
      successfulResponseHandler: createEventSourceResponseHandler(
        anthropicMessagesChunkSchema
      ),
      abortSignal: options.abortSignal
    });
    const { messages: rawPrompt, ...rawSettings } = args;
    let finishReason = "other";
    const usage = {
      promptTokens: Number.NaN,
      completionTokens: Number.NaN
    };
    return {
      stream: response.pipeThrough(
        new TransformStream({
          transform(chunk, controller) {
            if (!chunk.success) {
              controller.enqueue({ type: "error", error: chunk.error });
              return;
            }
            const value = chunk.value;
            switch (value.type) {
              case "ping":
              case "content_block_start":
              case "content_block_stop": {
                return;
              }
              case "content_block_delta": {
                controller.enqueue({
                  type: "text-delta",
                  textDelta: value.delta.text
                });
                return;
              }
              case "message_start": {
                usage.promptTokens = value.message.usage.input_tokens;
                usage.completionTokens = value.message.usage.output_tokens;
                return;
              }
              case "message_delta": {
                usage.completionTokens = value.usage.output_tokens;
                finishReason = mapAnthropicStopReason(value.delta.stop_reason);
                return;
              }
              case "message_stop": {
                controller.enqueue({ type: "finish", finishReason, usage });
                return;
              }
              default: {
                const _exhaustiveCheck = value;
                throw new Error(`Unsupported chunk type: ${_exhaustiveCheck}`);
              }
            }
          }
        })
      ),
      rawCall: { rawPrompt, rawSettings },
      warnings
    };
  }
};
var anthropicMessagesResponseSchema = z2.object({
  type: z2.literal("message"),
  content: z2.array(
    z2.discriminatedUnion("type", [
      z2.object({
        type: z2.literal("text"),
        text: z2.string()
      }),
      z2.object({
        type: z2.literal("tool_use"),
        id: z2.string(),
        name: z2.string(),
        input: z2.unknown()
      })
    ])
  ),
  stop_reason: z2.string().optional().nullable(),
  usage: z2.object({
    input_tokens: z2.number(),
    output_tokens: z2.number()
  })
});
var anthropicMessagesChunkSchema = z2.discriminatedUnion("type", [
  z2.object({
    type: z2.literal("message_start"),
    message: z2.object({
      usage: z2.object({
        input_tokens: z2.number(),
        output_tokens: z2.number()
      })
    })
  }),
  z2.object({
    type: z2.literal("content_block_start"),
    index: z2.number(),
    content_block: z2.object({
      type: z2.literal("text"),
      text: z2.string()
    })
  }),
  z2.object({
    type: z2.literal("content_block_delta"),
    index: z2.number(),
    delta: z2.object({
      type: z2.literal("text_delta"),
      text: z2.string()
    })
  }),
  z2.object({
    type: z2.literal("content_block_stop"),
    index: z2.number()
  }),
  z2.object({
    type: z2.literal("message_delta"),
    delta: z2.object({ stop_reason: z2.string().optional().nullable() }),
    usage: z2.object({ output_tokens: z2.number() })
  }),
  z2.object({
    type: z2.literal("message_stop")
  }),
  z2.object({
    type: z2.literal("ping")
  })
]);

// anthropic/anthropic-facade.ts
var Anthropic = class {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl;
    this.apiKey = options.apiKey;
  }
  get baseConfig() {
    var _a;
    return {
      baseUrl: (_a = this.baseUrl) != null ? _a : "https://api.anthropic.com/v1",
      headers: () => ({
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "tools-2024-04-04",
        "x-api-key": loadApiKey({
          apiKey: this.apiKey,
          environmentVariableName: "ANTHROPIC_API_KEY",
          description: "Anthropic"
        })
      })
    };
  }
  messages(modelId, settings = {}) {
    return new AnthropicMessagesLanguageModel(modelId, settings, {
      provider: "anthropic.messages",
      ...this.baseConfig
    });
  }
};
var anthropic = new Anthropic();
export {
  Anthropic,
  anthropic
};
//# sourceMappingURL=index.mjs.map