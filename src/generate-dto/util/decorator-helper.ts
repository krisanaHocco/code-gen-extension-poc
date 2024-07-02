import {
  PropertyDeclaration,
  Type,
  ts,
  Node,
  ImportDeclaration,
} from "ts-morph";
import path from "path";

import { parsePropertiesNodeToObjectLiteral } from "../util/transform-initializer";
import { DecoratorStructure, decoratorList } from "../types/decorator";

const nodeModules = "node_modules";

export function getTypeForProperty(
  property: PropertyDeclaration,
  outputPath: string,
  options?: {
    importDeclarations: ImportDeclaration[];
  }
): { typeValue: string; typeImportPath: string } {
  const typeNode = property.getType().isArray()
    ? property.getType().getArrayElementType() || property.getType()
    : property.getType();

  const typeSymbol = typeNode.getSymbol();
  if (!typeSymbol) {
    return { typeValue: typeNode.getText(), typeImportPath: "" };
  }

  const declarations = typeSymbol.getDeclarations();
  if (!declarations) {
    return { typeValue: typeNode.getText(), typeImportPath: "" };
  }

  const declarationFilePath = declarations[0].getSourceFile().getFilePath();
  if (validateExternalType(declarationFilePath)) {
    if (options?.importDeclarations) {
      const importDeclaration = options.importDeclarations.find((id) =>
        declarationFilePath.includes(id.getModuleSpecifierValue())
      );
      if (importDeclaration) {
        return {
          typeValue: importDeclaration.getDefaultImport()?.getText() || "",
          typeImportPath: "",
        };
      }
    }

    return { typeValue: typeNode.getText(), typeImportPath: "" };
  }

  return {
    typeValue: getInternalType(typeNode),
    typeImportPath: getRelativePath(outputPath, declarationFilePath),
  };
}

function getInternalType(type: Type<ts.Type>): string {
  const matchType = type.getText().match(/import\(".*?"\)\.([A-Za-z0-9_]+)/);
  return matchType?.[1] || type.getText();
}

function validateExternalType(path: string) {
  return path.includes(nodeModules);
}

function getRelativePath(outputPath: string, filePath: string) {
  return path.relative(path.dirname(outputPath), filePath.replace(/\.ts$/, ""));
}

export function getDecoratorForProperty(property: PropertyDeclaration): {
  decorators: DecoratorStructure[];
  decoratorImports: string[];
} {
  const decoratorSet = new Set<string>();
  const decoratorImportSet = new Set<string>();
  const type = property.getType().getText();

  const columnDecorator = property.getDecorator("Column");
  const oneToManyDecorator = property.getDecorator("OneToMany");
  const manyToOneDecorator = property.getDecorator("ManyToOne");

  if (columnDecorator) {
    const { decoratorSet: decoratorColumnSet, decoratorImportSet: importSet } =
      getDecoratorsByColumnOption(
        columnDecorator.getArguments(),
        property.getType()
      );
    decoratorColumnSet.forEach((value) => decoratorSet.add(value));
    importSet.forEach((value) => decoratorImportSet.add(value));
  }

  if (oneToManyDecorator) {
    decoratorSet.add(decoratorList.validateNested.expression());
    decoratorImportSet.add(decoratorList.validateNested.name);

    if (oneToManyDecorator.getArguments().length !== 0) {
      oneToManyDecorator.getArguments().forEach((arg) => {
        if (Node.isArrowFunction(arg) && !arg.getReturnType().isAny()) {
          const type = getTypeFromRepresentClass(
            getInternalType(arg.getReturnType())
          );
          decoratorSet.add(`Type(() => ${type})`);
        }
      });
    }
  }

  switch (type) {
    case "number":
      decoratorSet.add(decoratorList.isNumber.expression());
      decoratorImportSet.add(decoratorList.isNumber.name);
      decoratorSet.add(decoratorList.isNumber.returnConstructor());
      break;
    case "string":
      decoratorSet.add(decoratorList.isString.expression());
      decoratorImportSet.add(decoratorList.isString.name);
      decoratorSet.add(decoratorList.isString.returnConstructor());
      break;
    case "Date":
      decoratorSet.add(decoratorList.isDateString.expression());
      decoratorImportSet.add(decoratorList.isDateString.name);
      decoratorSet.add(decoratorList.isDateString.returnConstructor());
      break;
    case "boolean":
      decoratorSet.add(decoratorList.isBoolean.expression());
      decoratorImportSet.add(decoratorList.isBoolean.name);
      decoratorSet.add(decoratorList.isBoolean.returnConstructor());
      break;
  }

  const descList: string[] = Array.from(decoratorSet);
  return {
    decorators: pushDecoratorListToDecoratorStructureList(descList),
    decoratorImports: Array.from(decoratorImportSet),
  };
}

function getDecoratorsByColumnOption(
  args: Node<ts.Node>[],
  propertyType: Type<ts.Type>
) {
  const decoratorSet = new Set<string>();
  const decoratorImportSet = new Set<string>();
  if (args.length !== 0) {
    args.forEach((arg) => {
      if (Node.isObjectLiteralExpression(arg)) {
        const objArgument = parsePropertiesNodeToObjectLiteral(arg);
        if (
          objArgument.hasOwnProperty("nullable") &&
          objArgument?.nullable === true
        ) {
          decoratorSet.add(decoratorList.isOptional.expression());
          decoratorImportSet.add(decoratorList.isOptional.name);
        } else {
          decoratorSet.add(decoratorList.isNotEmpty.expression());
          decoratorImportSet.add(decoratorList.isNotEmpty.name);
        }

        if (objArgument.hasOwnProperty("length")) {
          decoratorSet.add(
            decoratorList.length.expression(1, objArgument.length)
          );
          decoratorImportSet.add(decoratorList.length.name);
        }

        if (objArgument.hasOwnProperty("enum")) {
          decoratorSet.add(
            decoratorList.isEnum.expression(getInternalType(propertyType))
          );
          decoratorImportSet.add(decoratorList.isEnum.name);
        }
      }
    });
  } else {
    decoratorSet.add(decoratorList.isNotEmpty.expression());
    decoratorImportSet.add(decoratorList.isNotEmpty.name);
  }
  return { decoratorSet, decoratorImportSet };
}

function pushDecoratorListToDecoratorStructureList(
  decoratorList: string[]
): DecoratorStructure[] {
  const decoratorStructureList: DecoratorStructure[] = [];
  decoratorList.forEach((value) => {
    decoratorStructureList.push({ name: value });
  });
  return decoratorStructureList;
}

const getTypeFromRepresentClass = (typeText: string) => {
  switch (typeText) {
    case "NumberConstructor":
      return "Number";
    case "StringConstructor":
      return "String";
    case "BooleanConstructor":
      return "Boolean";
    case "ArrayConstructor":
    case "any[]":
      return "Array";
    default:
      return typeText;
  }
};
