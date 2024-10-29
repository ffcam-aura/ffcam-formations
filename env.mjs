import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        SMTP_HOST: z.string(),
        SMTP_PORT: z.coerce.number(),
        SMTP_USER: z.string(),
        SMTP_PASSWORD: z.string(),
        EMAIL_FROM: z.string().email(),
        EMAIL_SENDER_NAME: z.string(),
        SYNC_NOTIFICATION_EMAIL: z.string().email(),
        POSTGRES_URL: z.string(),
        POSTGRES_URL_NON_POOLING: z.string()
    },
    
    runtimeEnv: {
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASSWORD: process.env.SMTP_PASSWORD,
        EMAIL_FROM: process.env.EMAIL_FROM,
        EMAIL_SENDER_NAME: process.env.EMAIL_SENDER_NAME,
        SYNC_NOTIFICATION_EMAIL: process.env.SYNC_NOTIFICATION_EMAIL,
        POSTGRES_URL: process.env.POSTGRES_URL,
        POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING
    }
});