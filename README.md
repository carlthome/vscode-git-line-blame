# Git Line Blame

Visual Studio Code extension that displays inline information in the text editor about the latest commit that edited the currently selected line.

## Features

This extension is small on purpose and doesn't come with any settings. It will automatically activate when you open a workspace that contains a git repository. When you select a line in the text editor, the commit summary, author, and time elapsed since that commit edited that line will appear next to the line number in a discrete and unobtrusive color.

## Usage

Simply install the latest version from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=carlthome.git-line-blame). Releases are made from [GitHub Actions](https://github.com/carlthome/vscode-git-line-blame/releases).

## Develop

First, if you're new to VS Code extension development, skim through [CONTRIBUTING.md](./CONTRIBUTING.md) first.

```sh
# Install package in the working directory
npm install

# (Windows & MacOS) Run unit tests
npm test

# (Linux) Prepend this command with `xvfb-run -a` when running on Linux.
xvfb-run -a npm test
```

### Release a new version

Create a release by `gh release create` and fill in the details. Make sure the package version matches the chosen git tag as per `"v{major.minor.patch}"`.

## FAQ

### Why not just use GitLens instead?

GitLens is an excellent extension but I found it overly complicated for my needs, with many features I didn't need. It's also frustrating that the extension keeps pushing for its paid version. In contrast, this extension will always be free and open source software (see [license](./LICENSE)), and will never do more than just provide the line blame information.

### What's that extension icon?

Created by prompting Stable Diffusion over in [stable-diffusion](https://github.com/carlthome/stable-diffusion) with `python main.py --prompt "git line blame"`. 🫢
