// This loads a font file so that the opentype library can measure text width
// (see src/PlotFit.js)
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import opentype from "opentype.js";

// Convert the module's URL to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const loadSync = (relativePath) => {
  const absolutePath = resolve(__dirname, relativePath);
  const buffer = readFileSync(absolutePath);
  // Convert the buffer to an ArrayBuffer
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );
  return opentype.parse(arrayBuffer);
};
export const font = loadSync("../fonts/abc-favorit/ABCFavorit-Medium.otf");
