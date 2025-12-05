import { db } from "@/db";

export function wait(seconds: number): Promise<number> {
  return new Promise((res) => setTimeout(res, seconds));
}
