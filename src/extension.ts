import * as vscode from "vscode";
import * as cp from "child_process";

import {
  parseGitBlamePorcelain,
  formatMessage,
  formatHoverMessage,
} from "./lib";

const decorationType = vscode.window.createTextEditorDecorationType({
  after: {
    textDecoration: "none; opacity: 0.25;",
    margin: "0 0 0 6em",
  },
});

function showDecoration(e: { readonly textEditor: vscode.TextEditor }) {
  const editor = e.textEditor;
  const document = editor.document;
  const activeLine = document.lineAt(editor.selection.active.line);
  const { uri: file, isDirty } = document;

  const command = "git";
  const n = activeLine.lineNumber;
  const args = ["blame", "--porcelain", `-L${n + 1},+1`, file.fsPath];

  if (isDirty) {
    args.push("--content", "-");
  }

  const workspaceFolder = vscode.workspace.getWorkspaceFolder(file);
  const workspaceFolderPath = workspaceFolder?.uri.fsPath;
  const options = { cwd: workspaceFolderPath };
  const cmd = cp.spawn(command, args, options);

  if (isDirty) {
    cmd.stdin.write(editor.document.getText());
    cmd.stdin.end();
  }

  const gitUser = cp.execSync("git config user.name").toString().trim();

  cmd.stdout.on("data", (data) => {
    const blame = data.toString();

    const fields = parseGitBlamePorcelain(blame);
    const message = formatMessage(fields, gitUser);
    const hoverMessage = formatHoverMessage(fields);

    const range = new vscode.Range(
      activeLine.lineNumber,
      activeLine.text.length,
      activeLine.lineNumber,
      activeLine.text.length + message.length
    );

    const renderOptions = {
      after: {
        contentText: message,
      },
    };

    const decorations = [
      {
        range: range,
        hoverMessage: hoverMessage,
        renderOptions: renderOptions,
      },
    ];

    editor.setDecorations(decorationType, decorations);
  });
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "git-line-blame" has activated.');
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(showDecoration),
    vscode.window.onDidChangeTextEditorVisibleRanges(showDecoration),
    vscode.workspace.onDidSaveTextDocument((e) => {
      const editor = vscode.window.activeTextEditor;
      if (editor !== undefined && e === editor.document) {
        showDecoration({ textEditor: editor });
      }
    })
  );
}
