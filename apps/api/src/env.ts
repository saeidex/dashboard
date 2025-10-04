/* eslint-disable node/no-process-env */
import { config } from "dotenv"
import { expand } from "dotenv-expand"
import path from "node:path"
import { z } from "zod"

function resolveDefaultDatabaseUrl(nodeEnv = "development") {
  switch (nodeEnv) {
    case "production":
      return "file:/data/prod.db"
    case "test":
      return "file:./test.db"
    default:
      return "file:./dev.db"
  }
}

const ALLOWED_DATABASE_PROTOCOLS = new Set(["file:", "libsql:", "http:", "https:"])

const DatabaseUrlSchema = z.string().trim().superRefine((val, ctx) => {
  try {
    const parsed = new URL(val)

    if (!ALLOWED_DATABASE_PROTOCOLS.has(parsed.protocol)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["DATABASE_URL"],
        message: `Unsupported DATABASE_URL protocol "${parsed.protocol}"`,
      })
    }
  }
  catch {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["DATABASE_URL"],
      message: "DATABASE_URL must be a valid URL",
    })
  }
})

expand(config({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === "test" ? ".env.test" : ".env",
  ),
}))

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  CLIENT_URL: z.url().default("http://localhost:5173"),
  PORT: z.coerce.number().default(9999),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]),
  DATABASE_URL: DatabaseUrlSchema.optional().default(() => resolveDefaultDatabaseUrl(process.env.NODE_ENV)),
  DATABASE_AUTH_TOKEN: z.string().optional(),
  TRUSTED_ORIGINS: z.string().default("http://localhost:5173").transform(val => val.split(",").map(s => s.trim())),
}).superRefine((input, ctx) => {
  let protocol: string | undefined
  try {
    protocol = new URL(input.DATABASE_URL).protocol
  }
  catch {
    protocol = undefined
  }

  const requiresAuthToken = protocol !== "file:"

  if (input.NODE_ENV === "production" && requiresAuthToken && !input.DATABASE_AUTH_TOKEN) {
    ctx.addIssue({
      code: "invalid_type",
      expected: "string",
      received: "undefined",
      path: ["DATABASE_AUTH_TOKEN"],
      message: "Must be set when NODE_ENV is 'production'",
    })
  }
})

export type env = z.infer<typeof EnvSchema>

const { data: env, error } = EnvSchema.safeParse(process.env)

if (error) {
  console.error("❌ Invalid env:")
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2))
  process.exit(1)
}

export default env!
