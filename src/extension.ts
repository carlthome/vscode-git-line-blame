import * as vscode from "vscode";
import { GitExtension, Repository, API } from "./git";

const annotationDecoration: vscode.TextEditorDecorationType =
  vscode.window.createTextEditorDecorationType({
    after: {
      margin: "0 0 0 3em",
      textDecoration: "none",
    },
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen,
  });

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "git-line-commit" has activated.');

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

      const gitExtension =
        vscode.extensions.getExtension<GitExtension>("vscode.git");
      if (gitExtension === undefined) {
        vscode.window.showErrorMessage("Unable to load git extension");
        return;
      }
      const git = gitExtension.exports.getAPI(1);
      const repo = git.getRepository(activeEditor.document.uri);

      if (repo === null) {
        vscode.window.showErrorMessage("Unable to get git repository");
        return;
      }

      repo.blame(activeEditor.document.uri.path).then((blame) => {
        const range = activeEditor.document.validateRange(
          new vscode.Range(
            activeLine.lineNumber,
            activeLine.text.length,
            activeLine.lineNumber,
            0
          )
        );

        // TODO Pretty format and only use blame for selected line.
        // activeLine.text
        const message = blame;

        const renderOptions = {
          after: {
            backgroundColor: "none",
            color: new vscode.ThemeColor("editor.foreground"),
            contentText: message,
            fontWeight: "normal",
            fontStyle: "normal",
            textDecoration: "none; opacity: 0.5; position: absolute;",
          },
        };

        const decorations = [
          { range: range, hoverMessage: message, renderOptions: renderOptions },
        ];

        activeEditor.setDecorations(annotationDecoration, decorations);
      });
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
