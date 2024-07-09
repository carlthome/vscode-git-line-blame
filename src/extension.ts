import * as vscode from "vscode";
import * as cp from "child_process";
import { throttle } from "throttle-debounce";
import { fetchFileBlame, CommitInfo } from "./git"; 

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

const FileCommits: Map<string, CommitInfo[]> = new Map();

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


  const commitInfos = FileCommits.get(file.fsPath);
  if (commitInfos !== undefined) {
    const thiscommitInfo = commitInfos.find(info => info.lineNumber === n);
    // TODO: get values of fields from thiscommitInfo

  }
  else {
    console.log(`No pre-fetched commit information found for ${file.fsPath}`);
    // TODO: move obsolete logic from down below here if the commitInfos is not found
  }  
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(file);
  const workspaceFolderPath = workspaceFolder?.uri.fsPath;
  const options = { cwd: workspaceFolderPath };
  const cmd = cp.spawn(command, args, options);

  if (isDirty) {
    cmd.stdin.write(editor.document.getText());
    cmd.stdin.end();
  }

  const gitUser = cp.execSync("git config user.name").toString().trim() || "John Doe";

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

function showFileBlame(e: { readonly textEditor: vscode.TextEditor }) {

  const editor = e.textEditor;
  const document = editor.document;
  const { uri: file, isDirty } = document;
  
  fetchFileBlame(file.fsPath)
    .then(commitInfos => {
      console.log(`Commit Information for ${file.fsPath}`); 
      console.log(commitInfos);
      FileCommits.set(file.fsPath, commitInfos);
    })

}
export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "git-line-blame" has activated.');
  let showDecorationThrottled = throttle(100, showDecoration);
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(showDecorationThrottled),
    vscode.window.onDidChangeTextEditorVisibleRanges(showDecorationThrottled),
    vscode.window.onDidChangeActiveTextEditor((e) => {
      const editor = vscode.window.activeTextEditor;
      if (editor !== undefined && e === editor) {
          showFileBlame({ textEditor: editor })
      }
    }),
    vscode.window.onDidChangeVisibleTextEditors(editors => {
        const closedEditors = vscode.window.visibleTextEditors.filter(editor =>
            !editors.includes(editor)
        );
        closedEditors.forEach(closedEditor => {
            console.log(`Closed file: ${closedEditor.document.fileName}`);
            FileCommits.delete(closedEditor.document.fileName);
        });
    }),
    vscode.workspace.onDidSaveTextDocument((e) => {
      const editor = vscode.window.activeTextEditor;
      if (editor !== undefined && e === editor.document) {
        showDecorationThrottled({ textEditor: editor });
      }
    })
  );
}
