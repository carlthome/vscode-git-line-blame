# Contributing

## What's in the folder

- This folder contains all of the files necessary for the extension.
- `package.json` - this is the manifest file in which you declare the extension.
- `src/extension.ts` - this is the main file where functionality is provided.
  - The file exports one function, `activate`, which is called the very first time the extension is activated.

## Get up and running straight away

- Press `F5` to open a new window with the extension loaded.
- Set breakpoints in your code inside `src/extension.ts` to debug the extension.
- Find output from the extension in the debug console.

## Make changes

- You can relaunch the extension from the debug toolbar after changing code in `src/extension.ts`.
- You can also reload (`Ctrl+R` or `Cmd+R` on Mac) the VS Code window with the extension to load your changes.

## Explore the API

- You can open the full set of our API when you open the file `node_modules/@types/vscode/index.d.ts`.

## Run tests

- Open the debug viewlet (`Ctrl+Shift+D` or `Cmd+Shift+D` on Mac) and from the launch configuration dropdown pick `Extension Tests`.
- Press `F5` to run the tests in a new window with the extension loaded.
- See the output of the test result in the debug console.
- Make changes to `src/test/suite/extension.test.ts` or create new test files inside the `test/suite` folder.
  - The provided test runner will only consider files matching the name pattern `**.test.ts`.
  - You can create folders inside the `test` folder to structure your tests any way you want.

## Go further

- [Follow UX guidelines](https://code.visualstudio.com/api/ux-guidelines/overview) to create extensions that seamlessly integrate with VS Code's native interface and patterns.
- Reduce the extension size and improve the startup time by [bundling the extension](https://code.visualstudio.com/api/working-with-extensions/bundling-extension).
- [Publish the extension](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) on the VS Code extension marketplace.
- Automate builds by setting up [Continuous Integration](https://code.visualstudio.com/api/working-with-extensions/continuous-integration).
