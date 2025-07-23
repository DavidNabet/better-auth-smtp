import fs from "fs/promises";
import { join } from "path";

export const uploadFile = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(buffer);
  const path = join(process.cwd(), "public/uploads/" + file.name);
  if (!path) return { message: "Path not found" };
  const controller = new AbortController();
  try {
    const promise = fs.writeFile(path, fileBuffer, {
      signal: controller.signal,
    });
    await promise;
    return {
      url: `${process.env.BETTER_AUTH_URL}/uploads/${file.name}`,
      message: null,
    };
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log("Operation aborted");
    } else {
      console.error("uploadError: ", error);
    }
  }
};
