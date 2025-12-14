import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const serverEnvSchema = {
    // SMTP Configuration
    SMTP_HOST: z.string().min(1, "SMTP_HOST is required"),
    SMTP_PORT: z.coerce.number().int().positive(),
    SMTP_USER: z.string().min(1, "SMTP_USER is required"),
    SMTP_PASSWORD: z.string().min(1, "SMTP_PASSWORD is required"),

    // Email Configuration
    EMAIL_FROM: z.string().email("EMAIL_FROM must be a valid email"),
    EMAIL_SENDER_NAME: z.string().min(1, "EMAIL_SENDER_NAME is required"),
    SYNC_NOTIFICATION_EMAIL: z.string().email("SYNC_NOTIFICATION_EMAIL must be a valid email"),

    // Database
    POSTGRES_URL: z.string().url("POSTGRES_URL must be a valid URL"),
    POSTGRES_URL_NON_POOLING: z.string().url("POSTGRES_URL_NON_POOLING must be a valid URL"),

    // Environment
    VERCEL_ENV: z.enum(["development", "preview", "production"]).default("development"),

    // CRON Security - required in production for secure CRON endpoints
    // Recommended: at least 32 characters for security (validated at runtime)
    CRON_SECRET: z.string().optional(),

    // Healthcheck (dead man's switch) - ping URL from healthchecks.io or similar
    HEALTHCHECK_SYNC_URL: z.string().url().optional(),

    // Healthcheck for email delivery - email address from healthchecks.io
    HEALTHCHECK_NOTIFICATIONS_EMAIL: z.string().email().optional(),
} as const;

const clientEnvSchema = {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
} as const;

type ServerEnvSchema = typeof serverEnvSchema;
type ClientEnvSchema = typeof clientEnvSchema;

const generateServerRuntimeEnv = (schema: ServerEnvSchema): Record<keyof ServerEnvSchema, string | undefined> => {
    return Object.keys(schema).reduce((acc, key) => ({
        ...acc,
        [key]: process.env[key]
    }), {}) as Record<keyof ServerEnvSchema, string | undefined>;
};

const generateClientRuntimeEnv = (schema: ClientEnvSchema): Record<keyof ClientEnvSchema, string | undefined> => {
    return Object.keys(schema).reduce((acc, key) => ({
        ...acc,
        [key]: process.env[key]
    }), {}) as Record<keyof ClientEnvSchema, string | undefined>;
};

export const env = createEnv({
    server: serverEnvSchema,
    client: clientEnvSchema,
    runtimeEnv: {
        ...generateServerRuntimeEnv(serverEnvSchema),
        ...generateClientRuntimeEnv(clientEnvSchema),
    },
});