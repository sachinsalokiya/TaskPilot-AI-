import path from "path";
import dotenv from "dotenv";

const envPath = path.resolve(__dirname, "../../.env");

dotenv.config({ path: envPath, override: true });

const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"] as const;

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.warn(
      `Warning: ${key} is not set. Check ${envPath} or copy from .env.example.`
    );
  }
}
