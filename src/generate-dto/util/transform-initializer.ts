import { Node } from "ts-morph";

import { ObjectLiteral } from "../types/object-literal";

export function transformValueFromInitializer(
  initializer: Node | undefined
): any {
  if (!initializer) return undefined;

  if (
    Node.isStringLiteral(initializer) ||
    Node.isNoSubstitutionTemplateLiteral(initializer)
  ) {
    return initializer.getText().slice(1, -1);
  } else if (Node.isNumericLiteral(initializer)) {
    return parseFloat(initializer.getText());
  } else if (Node.isTrueLiteral(initializer)) {
    return true;
  } else if (Node.isFalseLiteral(initializer)) {
    return false;
  } else if (Node.isArrayLiteralExpression(initializer)) {
    return initializer
      .getElements()
      .map(transformValueFromInitializer(initializer));
  } else if (Node.isObjectLiteralExpression(initializer)) {
    return parsePropertiesNodeToObjectLiteral(initializer);
  } else if (Node.isIdentifier(initializer)) {
    return initializer.getText();
  } else if (Node.isNullLiteral(initializer)) {
    return null;
  }

  return initializer.getText();
}

export function parsePropertiesNodeToObjectLiteral(node: Node) {
  const obj: ObjectLiteral = {};
  if (!Node.isObjectLiteralExpression(node)) {
    return obj;
  }

  node.getProperties().forEach((prop) => {
    if (Node.isPropertyAssignment(prop)) {
      const key = prop.getName();
      obj[key] = transformValueFromInitializer(prop.getInitializer());
    }
  });
  return obj;
}
