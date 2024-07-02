import path from "path";

import { generate } from "../generator/dto.generator";

export class GenerativeCodeService {
  constructor() {}

  async generateCode(selectedText: string): Promise<string> {
    return `\n\tSelected text : ${selectedText}`;
  }

  async generateDto(entityPath: string) {
    const splitPath = entityPath.split("/");
    const filename = String(splitPath.pop());
    const entityDir = splitPath.join("/");

    if (filename.endsWith(".entity.ts")) {
      const dtoDir = path.join(entityDir, "dtos");
      generate(filename, entityPath, dtoDir, { useCase: "Create" });
    }
  }
}
