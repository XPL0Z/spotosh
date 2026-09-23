import fs from "node:fs";
import path from "node:path";
import { format } from "node:util";
import { currentUser } from "@/services/auth";

const LOG_FILE = process.env.LOG_FILE ?? path.resolve("logs", "web.log");

let stream: fs.WriteStream | null = null;
try {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  stream = fs.createWriteStream(LOG_FILE, { flags: "a" });
  stream.on("error", (err) => {
    console.error("[logger] write failed:", err.message);
    stream = null;
  });
} catch (e) {
  console.error(`[logger] cannot open ${LOG_FILE}:`, e);
}

function write(level: "INFO" | "ERROR", args: unknown[]) {
  const line = format(...args);
  if (level === "ERROR") console.error(line);
  else console.log(line);
  stream?.write(`${new Date().toISOString()} ${level} ${line}\n`);
}

export const log = (...args: unknown[]) => write("INFO", args);
export const logError = (...args: unknown[]) => write("ERROR", args);

export function withLogging<T extends Request>(handler: (req: T) => Promise<Response>) {
  return async (req: T): Promise<Response> => {
    const start = Date.now();
    const { pathname, search } = new URL(req.url);
    const user = await currentUser().catch(() => "unknown");
    const label = `[api] ${user} ${req.method} ${pathname}${search}`;
    try {
      const res = await handler(req);
      log(`${label} ${res.status} ${Date.now() - start}ms`);
      return res;
    } catch (e) {
      logError(`${label} threw after ${Date.now() - start}ms:`, e);
      throw e;
    }
  };
}
