import fs from "fs/promises";
import { join } from "path";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toBase64(file: File) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = (error) => {
      reject(error);
    };
  });
}

export const uploadFile = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(buffer);
  const path = join(process.cwd(), "public/uploads/" + file.name);
  await fs.writeFile(path, fileBuffer);

  return { url: `/uploads/${file.name}` };
};
