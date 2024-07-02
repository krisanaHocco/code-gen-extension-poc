import * as vscode from "vscode";
import { GenerativeCodeService } from "./generate-dto/service/generative-code.service";
import { ExternalApiService } from "./external-api/service/external-api.service";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "code-gen-extension-poc" is now active!'
  );

  const disposable = vscode.commands.registerCommand(
    "code-gen-extension-poc.helloWorld",
    async () => {
      vscode.window.showInformationMessage(
        "Hello World from CodeGenExtensionPoc!"
      );
      const service = new ExternalApiService();
      const response = await service.get("https://randomuser.me/api/");
      console.log("Response : ", response);
    }
  );

  const service = new GenerativeCodeService();
  const genCodeCommand = vscode.commands.registerCommand(
    "code-gen-extension-poc.genCode",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const document = editor.document;
        const selection = editor.selection;
        const selectedText = document.getText(selection);

        const positionEnd = selection.end;

        const code = await service.generateCode(selectedText);

        editor
          .edit((editBuilder) => {
            editBuilder.insert(positionEnd, code);
          })
          .then((success) => {
            if (success) {
              vscode.window.showInformationMessage(
                "Inserted code after the selected block!"
              );
            } else {
              vscode.window.showErrorMessage("Failed to insert code.");
            }
          });
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
    genCodeCommand,
    pushCodeExplorerCommand,
    genDtoCommand
  );
}

export function deactivate() {}
