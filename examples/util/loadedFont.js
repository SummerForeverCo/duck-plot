import { readFileSync } from "fs";
import { resolve } from "path";
import opentype from "opentype.js";

const loadSync = (relativePath) => {
  // Resolve the absolute path based on the current file's directory
  const absolutePath = resolve(process.cwd(), relativePath);

  const buffer = readFileSync(absolutePath);
  // Convert the buffer to an ArrayBuffer
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );
  return opentype.parse(arrayBuffer);
};

// Adjust the relative path to be based on the project's root directory
export const font = loadSync(
  "public/fonts/inter/Inter-VariableFont_opsz,wght.ttf"
);
