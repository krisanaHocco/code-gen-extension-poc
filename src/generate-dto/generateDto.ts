import fs from "fs";
import path from "path";

import { generate } from "./generator/dto.generator";

async function generateAllDtos(entityDir: string, dtoDir: string) {
  const entityFiles = fs
    .readdirSync(entityDir)
    .filter((file) => file.endsWith(".entity.ts"));

  entityFiles.forEach((file) => {
    const entityPath = path.join(entityDir, file);
    generate(file, entityPath, dtoDir, { useCase: "Create" });
  });
}

generateAllDtos(path.join(__dirname, "entities"), path.join(__dirname, "dtos"));
