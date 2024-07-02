import { ImportDeclaration, Project, PropertyDeclaration } from "ts-morph";
import path from "path";

import {
  getDecoratorForProperty,
  getTypeForProperty,
} from "../util/decorator-helper";

export function generate(
  entityFileName: string,
  entityFilePath: string,
  outputDir: string,
  options: {
    useCase: "Create" | "Update" | "Delete" | "Get";
  }
) {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(entityFilePath);
  const entityClass = sourceFile.getClasses()[0];
  const importDeclarations: ImportDeclaration[] = [];

  const fullOutputFilePath = path.join(
    outputDir,
    entityFileName.replace(
      ".entity.ts",
      `-${options.useCase.toLowerCase()}.dto.ts`
    )
  );

  const dtoProperties: PropertyDeclaration[] = entityClass.getProperties();
  const dtoSourceFile = project.createSourceFile(
    fullOutputFilePath,
    undefined,
    {
      overwrite: true,
    }
  );

  sourceFile.getImportDeclarations().forEach((importDeclaration) => {
    const defaultImport = importDeclaration.getDefaultImport();
    if (defaultImport) {
      dtoSourceFile.addImportDeclaration({
        moduleSpecifier: importDeclaration.getModuleSpecifierValue(),
        namedImports: importDeclaration
          .getNamedImports()
          .map((namedImport) => namedImport.getName()),
        defaultImport: defaultImport.getText(),
      });
      importDeclarations.push(importDeclaration);
    }
  });

  const classDto = dtoSourceFile.addClass({
    name: `${entityClass.getName()}${options.useCase}Dto`,
    isExported: true,
  });

  /* Properties Section */
  const classValidateImports: string[] = [];
  const customTypeMap = new Map<string, string[]>();
  dtoProperties.forEach((property) => {
    const { decorators, decoratorImports } = getDecoratorForProperty(property);
    const { typeValue, typeImportPath } = getTypeForProperty(
      property,
      fullOutputFilePath,
      { importDeclarations }
    );

    if (typeImportPath) {
      if (customTypeMap.has(typeImportPath)) {
        customTypeMap.get(typeImportPath)!.push(typeValue);
      } else {
        customTypeMap.set(typeImportPath, [typeValue]);
      }
    }

    const typePrint = typeValue + (property.getType().isArray() ? "[]" : "");
    classDto
      .addProperty({
        name: property.getName(),
        type: typePrint,
        leadingTrivia: (writer) => writer.newLine(),
      })
      .addDecorators(decorators);
    classValidateImports.push(...decoratorImports);
  });

  const classValidateImportSet = new Set(classValidateImports);
  if (Array.from(classValidateImportSet).length) {
    dtoSourceFile.addImportDeclaration({
      namedImports: Array.from(classValidateImportSet),
      moduleSpecifier: "class-validator",
    });
  }

  dtoSourceFile.addImportDeclaration({
    namedImports: ["Type"],
    moduleSpecifier: "class-transformer",
  });

  if (customTypeMap.size) {
    customTypeMap.forEach((types, importPath) => {
      const typeSet = new Set<string>(types);
      dtoSourceFile.addImportDeclaration({
        namedImports: [...typeSet],
        moduleSpecifier: importPath,
      });
    });
  }

  dtoSourceFile.formatText();
  dtoSourceFile.saveSync();
}
