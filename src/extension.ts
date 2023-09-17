import * as vscode from "vscode";
import * as cp from "child_process";

import {
  parseGitBlamePorcelain,
  formatMessage,
  formatHoverMessage,
} from "./lib";

const annotationDecoration: vscode.TextEditorDecorationType =
  vscode.window.createTextEditorDecorationType({
    after: {
      margin: "0 0 0 6em",
      textDecoration: "none",
    },
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen,
  });

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "git-line-blame" has activated.');

  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection((e) => {
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor === undefined) {
        vscode.window.showErrorMessage("No active text editor");
        return;
      }

      const activeLine = activeEditor.document.lineAt(
        activeEditor.selection.active.line
      );

      const file = activeEditor.document.uri;
      const line = activeLine.lineNumber;
      const command = "git";
      const args = ["blame", "--porcelain", `-L${line + 1},+1`, file.fsPath];
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(file);
      const workspaceFolderPath = workspaceFolder?.uri.fsPath;
      const options = { cwd: workspaceFolderPath };
      const cmd = cp.spawn(command, args, options);

      cmd.stdout.on("data", (data) => {
        const blame = data.toString();

        const fields = parseGitBlamePorcelain(blame);
        const message = formatMessage(fields);
        const hoverMessage = formatHoverMessage(fields);

        const range = new vscode.Range(
          activeLine.lineNumber,
          activeLine.text.length,
          activeLine.lineNumber,
          activeLine.text.length + message.length
        );

        const renderOptions = {
          after: {
            backgroundColor: "none",
            color: new vscode.ThemeColor("editor.foreground"),
            contentText: message,
            fontWeight: "normal",
            fontStyle: "normal",
            textDecoration: "none; opacity: 0.25; position: absolute;",
          },
        };

        const decorations = [
          {
            range: range,
            hoverMessage: hoverMessage,
            renderOptions: renderOptions,
          },
        ];

        activeEditor.setDecorations(annotationDecoration, decorations);
      });
    })
  );
}
