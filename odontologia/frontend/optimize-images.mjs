
import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";

const inputDir = path.resolve("public/images");
const outputDir = path.resolve("public/images-optimized");

await mkdir(outputDir, { recursive: true });

const files = await readdir(inputDir);

for (const file of files) {
  if (!/\.(png|jpg|jpeg)$/i.test(file)) continue;

  const input = path.join(inputDir, file);
  const output = path.join(
    outputDir,
    `${path.parse(file).name}.webp`
  );

  await sharp(input)
    .rotate()
    .webp({
      quality: 88,
      effort: 6,
    })
    .toFile(output);

  console.log(`Convertido: ${file}`);
}

console.log("Otimização concluída.");
