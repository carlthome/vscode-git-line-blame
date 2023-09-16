import * as vscode from "vscode";
import * as cp from "child_process";

function parseGitBlamePorcelain(blame: string): { [key: string]: string } {
  const fields = Object.fromEntries(
    blame
      .trim()
      .split("\n")
      .map((line: string) => {
        const words = line.split(" ");
        const key = words[0];
        const value = words.slice(1).join(" ");
        return [key, value];
      })
  );
  return fields;
}

function relativeTimePassed(now: number, past: number): string {
  var msMinutes = 60 * 1000;
  var msHours = msMinutes * 60;
  var msDays = msHours * 24;
  var msMonths = msDays * 30;
  var msYears = msDays * 365;

  var diff = now - past;

  if (diff < msMinutes) {
    return Math.round(diff / 1000) + " seconds ago";
  } else if (diff < msHours) {
    return Math.round(diff / msMinutes) + " minutes ago";
  } else if (diff < msDays) {
    return Math.round(diff / msHours) + " hours ago";
  } else if (diff < msMonths) {
    return "Around " + Math.round(diff / msDays) + " days ago";
  } else if (diff < msYears) {
    return "Around " + Math.round(diff / msMonths) + " months ago";
  } else {
    return "Around " + Math.round(diff / msYears) + " years ago";
  }
}

const annotationDecoration: vscode.TextEditorDecorationType =
  vscode.window.createTextEditorDecorationType({
    after: {
      margin: "0 0 0 3em",
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
      const workspaceFolder =
        vscode.workspace.getWorkspaceFolder(file)?.uri.path;
      const options = { cwd: workspaceFolder };
      const cmd = cp.spawn(command, args, options);

      cmd.stdout.on("data", (data) => {
        const blame = data.toString();

        const fields = parseGitBlamePorcelain(blame);

        const range = new vscode.Range(
          activeLine.lineNumber,
          activeLine.text.length,
          activeLine.lineNumber,
          0
        );

        const elapsed = relativeTimePassed(
          Date.now(),
          parseInt(fields["author-time"]) * 1000
        );

        // TODO If same username, write "You" instead of username.
        // TODO If dirty, set summary to "Uncommitted changes".
        // TODO If close in time, set summary to "now".
        const message = `${fields.author}, ${elapsed} • ${fields.summary}`;
        const hoverMessage = JSON.stringify(fields, null, 2);

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

export function deactivate() {}
