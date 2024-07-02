import * as vscode from "vscode";
import { GenerativeCodeService } from "./generate-dto/service/generative-code.service";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "helper-code-gen-ai-test" is now active!'
  );

  const disposable = vscode.commands.registerCommand(
    "helper-code-gen-ai-test.helloWorld",
    () => {
      vscode.window.showInformationMessage(
        "Hello World from HelperCodeGenAITest!"
      );
    }
  );

  const service = new GenerativeCodeService();
  const pushCodeCommand = vscode.commands.registerCommand(
    "helper-code-gen-ai-test.pushCode",
    async () => {
      vscode.window.showInformationMessage("Push code to service");
      //   const text = vscode.window.activeTextEditor?.document.getText();

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
    "helper-code-gen-ai-test.pushCodeExplorer",
    async () => {
      vscode.window.showInformationMessage("Push code explorer to service");
    }
  );

  const genDtoCommand = vscode.commands.registerCommand(
    "helper-code-gen-ai-test.genDto",
    async (uri: vscode.Uri) => {
      vscode.window.showInformationMessage(
        "Push code explorer to service" + uri.fsPath
      );
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
