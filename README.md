# Deprecated: This functionality is now builtin within VS Code directly

Check out https://code.visualstudio.com/updates/v1_97#_git-blame-information for more information.

# Git Line Blame

Visual Studio Code extension that displays inline information in the text editor about the latest commit that edited the currently selected line.

## Features

This extension is small on purpose and doesn't come with any settings. It will automatically activate when you open a workspace that contains a git repository. When you select a line in the text editor, the commit summary, author, and time elapsed since that commit edited that line will appear next to the line number in a discrete and unobtrusive color.

## Usage

Simply install the latest version from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=carlthome.git-line-blame). Releases are made from [GitHub Actions](https://github.com/carlthome/vscode-git-line-blame/releases).

## Develop

First, if you're new to VS Code extension development, skim through [CONTRIBUTING.md](./CONTRIBUTING.md) first.

## Set up local development environment

```sh
# Install package in the working directory.
npm install

# (Windows & MacOS) Run unit tests.
npm test

# (Linux) Prepend `npm test` with `xvfb-run -a` when running on Linux.
xvfb-run -a npm test
```

### Release a new version

1. Update and commit the `CHANGELOG.md` with the new version and changes according to [semver](https://semver.org/)
1. `npm version minor` (or `major` or `patch`)
1. `git push`
1. `git push --tags`
1. Submit a new release by `gh release create v$(npm pkg get version | xargs)` and fill in the details.

## FAQ

### Why not just use GitLens instead?

GitLens is an excellent extension but I found it overly complicated for my needs, with many features I didn't need. It's also frustrating that the extension keeps pushing for its paid version. In contrast, this extension will always be free and open source software (see [license](./LICENSE)), and will never do more than just provide the line blame information.

### What's that extension icon?

Created by prompting Stable Diffusion over in [stable-diffusion](https://github.com/carlthome/stable-diffusion) with `python main.py --prompt "git line blame"`. 🫢
