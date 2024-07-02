export type DecoratorStructure = {
  name: string;
};

export const decoratorList = {
  isNotEmpty: {
    name: "IsNotEmpty",
    expression: (): string => {
      return "IsNotEmpty()";
    },
  },
  isOptional: {
    name: "IsOptional",
    expression: (): string => {
      return "IsOptional()";
    },
  },
  isString: {
    name: "IsString",
    returnConstructor: (): string => {
      return "Type(() => String)";
    },
    expression: (): string => {
      return "IsString()";
    },
  },
  isNumber: {
    name: "IsNumber",
    returnConstructor: (): string => {
      return "Type(() => Number)";
    },
    expression: (): string => {
      return "IsNumber()";
    },
  },
  isBoolean: {
    name: "IsBoolean",
    returnConstructor: (): string => {
      return "Type(() => Boolean)";
    },
    expression: (): string => {
      return "IsBoolean()";
    },
  },
  isDateString: {
    returnConstructor: (): string => {
      return "Type(() => Date)";
    },
    name: "IsDateString",
    expression: (): string => {
      return "IsDateString()";
    },
  },
  isEnum: {
    name: "IsEnum",
    expression: (enumExpression: string): string => {
      return `IsEnum(${enumExpression})`;
    },
  },
  length: {
    name: "Length",
    expression: (min: number, max: number): string => {
      return `Length(${min}, ${max})`;
    },
  },
  min: {
    name: "Min",
    expression: (value: number): string => {
      return `Min(${value})`;
    },
  },
  max: {
    name: "Max",
    expression: (value: number): string => {
      return `Max(${value})`;
    },
  },
  validateNested: {
    name: "ValidateNested",
    expression: (): string => {
      return `ValidateNested({ each: true })`;
    },
  },
};
