import * as vscode from "vscode";
import * as cp from "child_process";

function parseGitBlamePorcelain(blame: string): { [key: string]: string } {
  const lines = blame.trim().split("\n");
  lines[0] = `commit ${lines[0]}`;
  lines[lines.length - 1] = `line ${lines[lines.length - 1]}`;
  const fields = Object.fromEntries(
    lines.map((line: string) => {
      const words = line.split(" ");
      const key = words[0];
      const value = words.slice(1).join(" ");
      return [key, value];
    })
  );
  return fields;
}

function relativeTimePassed(now: number, past: number): string {
  const msMinutes = 60 * 1000;
  const msHours = msMinutes * 60;
  const msDays = msHours * 24;
  const msMonths = msDays * 30;
  const msYears = msDays * 365;

  const elapsed = now - past;

  if (elapsed < msMinutes) {
    Math.round(elapsed / 1000);
    return Math.round(elapsed / 1000) + " seconds ago";
  } else if (elapsed < msHours) {
    return Math.round(elapsed / msMinutes) + " minutes ago";
  } else if (elapsed < msDays) {
    return Math.round(elapsed / msHours) + " hours ago";
  } else if (elapsed < msMonths) {
    return "Around " + Math.round(elapsed / msDays) + " day(s) ago";
  } else if (elapsed < msYears) {
    return "Around " + Math.round(elapsed / msMonths) + " month(s) ago";
  } else {
    return "Around " + Math.round(elapsed / msYears) + " year(s) ago";
  }
}
("Around 3 day(s) ago");

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

        const hoverMessage = Object.entries(fields)
          .map((entry) => `- **${entry[0]}**: \`${entry[1]}\``)
          .join("\n");

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
