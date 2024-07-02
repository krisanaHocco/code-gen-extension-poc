import * as vscode from "vscode";
import { GenerativeCodeService } from "./generate-dto/service/generative-code.service";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "code-gen-extension-poc" is now active!'
  );

  const disposable = vscode.commands.registerCommand(
    "code-gen-extension-poc.helloWorld",
    () => {
      vscode.window.showInformationMessage(
        "Hello World from HelperCodeGenAITest!"
      );
    }
  );

  const service = new GenerativeCodeService();
  const pushCodeCommand = vscode.commands.registerCommand(
    "code-gen-extension-poc.pushCode",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        const code = await service.generateCode(selectedText);
        console.log(code);
      }
    }
  );

  const pushCodeExplorerCommand = vscode.commands.registerCommand(
    "code-gen-extension-poc.pushCodeExplorer",
    async () => {
      vscode.window.showInformationMessage("Push code explorer to service");
    }
  );

  const genDtoCommand = vscode.commands.registerCommand(
    "code-gen-extension-poc.genDto",
    async (uri: vscode.Uri) => {
      service.generateDto(uri.fsPath);
    }
  );

  context.subscriptions.push(
    disposable,
    pushCodeCommand,
    pushCodeExplorerCommand,
    genDtoCommand
  );
}

export function deactivate() {}
