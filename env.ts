import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const envSchema = {
    SMTP_HOST: z.string(),
    SMTP_PORT: z.coerce.number(),
    SMTP_USER: z.string(),
    SMTP_PASSWORD: z.string(),
    EMAIL_FROM: z.string().email(),
    EMAIL_SENDER_NAME: z.string(),
    SYNC_NOTIFICATION_EMAIL: z.string().email(),
    POSTGRES_URL: z.string(),
    POSTGRES_URL_NON_POOLING: z.string(),
    VERCEL_ENV: z.string()
} as const;

type EnvSchema = typeof envSchema;

const generateRuntimeEnv = (schema: EnvSchema): Record<keyof EnvSchema, string | undefined> => {
    return Object.keys(schema).reduce((acc, key) => ({
        ...acc,
        [key]: process.env[key]
    }), {}) as Record<keyof EnvSchema, string | undefined>;
};

export const env = createEnv({
    server: envSchema,
    runtimeEnv: generateRuntimeEnv(envSchema)
});