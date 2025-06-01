# Installing Command Line Developer Tools on macOS

## Method 1: Using Terminal

Open Terminal and run:

```bash
xcode-select --install
```

This will trigger the installation prompt. Click "Install" and follow the on-screen instructions.

## Method 2: Download from Apple Developer Website

1. Visit [Apple Developer Downloads](https://developer.apple.com/download/all/)
2. Sign in with your Apple ID
3. Search for "Command Line Tools"
4. Download the appropriate version for your macOS
5. Run the installer package

## Verifying Installation

After installation, verify it worked by running:

```bash
xcode-select -p
```

This should output something like `/Library/Developer/CommandLineTools`
