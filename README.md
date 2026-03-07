# Sitecore DevTools

A VS Code extension that provides a GUI interface for Sitecore CLI serialization modules, removing the need to manually run CLI commands.

## Features

- **Activity Bar Integration**: Dedicated Sitecore DevTools panel in the VS Code Activity Bar
- **Module Detection**: Automatically scans workspace for `module.json` files
- **TreeView UI**: Visual representation of all serialization modules with package icons
- **Pull/Push Operations**: Right-click context menu for individual module operations
- **Pull All Modules**: One-click to pull all detected modules
- **Pull Selected Modules**: QuickPick interface to select multiple modules for pulling
- **Smart Sync**: Automatically detect changed modules and pull only those that need syncing
- **File Watcher**: Automatically refreshes when `module.json` files are added, removed, or modified
- **Output Logging**: Dedicated output channel for command logging and debugging
- **Environment Configuration**: Configurable environment setting for CLI commands

## Screenshots

![Sitecore DevTools Panel](images/panel-placeholder.png)
*Sitecore DevTools Activity Bar with Serialization Modules TreeView*

![Context Menu](images/context-menu-placeholder.png)
*Right-click context menu for Pull/Push operations*

![Smart Sync](images/smart-sync-placeholder.png)
*Smart Sync detecting and pulling changed modules*

## Requirements

- **VS Code**: Version 1.85.0 or higher
- **Sitecore CLI**: Must be installed and configured
  - Install via: `dotnet tool install Sitecore.CLI`
- **.NET SDK**: Required for running Sitecore CLI commands
- **Sitecore Project**: Workspace must contain `module.json` files

## Installation

1. Download the `.vsix` file from releases
2. Open VS Code
3. Go to Extensions view (`Ctrl+Shift+X`)
4. Click the `...` menu and select "Install from VSIX..."
5. Select the downloaded `.vsix` file

## Usage

### Viewing Modules

1. Click the Sitecore DevTools icon in the Activity Bar
2. The "Serialization Modules" panel shows all detected modules
3. Click on a module to open its `module.json` file

### Pull/Push Individual Module

1. Right-click on a module in the TreeView
2. Select "Pull Module" or "Push Module"
3. The command executes in the integrated terminal

### Pull All Modules

1. Click the "Pull All Modules" button in the TreeView toolbar
2. All detected modules will be pulled sequentially

### Pull Selected Modules

1. Click the "Pull Selected Modules" button in the TreeView toolbar
2. Select modules from the QuickPick dropdown
3. Selected modules will be pulled

### Smart Sync

1. Click the "Smart Sync" button in the TreeView toolbar
2. The extension runs `dotnet sitecore ser status`
3. Changed items are mapped to their respective modules
4. Only affected modules are pulled

### Refresh Modules

Click the refresh button in the TreeView toolbar to manually rescan for modules.

## Extension Commands

| Command | Description |
|---------|-------------|
| `sitecoreDevtools.refreshModules` | Refresh the modules list |
| `sitecoreDevtools.pullModule` | Pull a specific module |
| `sitecoreDevtools.pushModule` | Push a specific module |
| `sitecoreDevtools.pullAllModules` | Pull all detected modules |
| `sitecoreDevtools.pullSelectedModules` | Open QuickPick to select and pull modules |
| `sitecoreDevtools.smartSync` | Detect and pull changed modules |

## Extension Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `sitecoreDevtools.environment` | string | `dev` | The Sitecore environment to use for CLI commands |
| `sitecoreDevtools.autoRefreshModules` | boolean | `true` | Automatically refresh modules when module.json files change |

## Module.json Format

The extension expects `module.json` files in the following format:

```json
{
  "namespace": "Feature.Navigation",
  "items": {
    "includes": [
      {
        "name": "Navigation",
        "path": "/sitecore/content/MySite/Navigation"
      }
    ]
  }
}
```

## CLI Commands Executed

The extension executes the following Sitecore CLI commands:

```bash
# Pull module
dotnet sitecore ser pull --module <ModuleName> --environment <env>

# Push module
dotnet sitecore ser push --module <ModuleName> --environment <env>

# Pull multiple modules
dotnet sitecore ser pull --module <Module1> --module <Module2> --environment <env>

# Get serialization status (for Smart Sync)
dotnet sitecore ser status --environment <env>
```

## Output Channel

View extension logs in the "Sitecore DevTools" output channel:

1. Open Output panel (`Ctrl+Shift+U`)
2. Select "Sitecore DevTools" from the dropdown

## Development

### Building from Source

```bash
# Clone the repository
git clone <repository-url>
cd sitecore-devtools

# Install dependencies
npm install

# Compile
npm run compile

# Watch mode
npm run watch
```

### Running in Debug Mode

1. Open the project in VS Code
2. Press `F5` to launch the Extension Development Host
3. The extension will be active in the new VS Code window

### Packaging

```bash
# Install vsce if not already installed
npm install -g @vscode/vsce

# Package the extension
vsce package
```

This creates a `.vsix` file that can be installed in VS Code.

## Troubleshooting

### Modules Not Detected

- Ensure `module.json` files exist in your workspace
- Check that files are not in `node_modules` directory
- Click the refresh button to rescan

### CLI Commands Failing

- Verify Sitecore CLI is installed: `dotnet sitecore --version`
- Check you're authenticated: `dotnet sitecore login`
- Verify the environment setting matches your configuration

### Smart Sync Not Working

- Ensure `dotnet sitecore ser status` works from terminal
- Check the Output channel for error messages
- Verify module include paths match the Sitecore item paths

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Changelog

### 1.0.0

- Initial release
- Module detection and TreeView display
- Pull/Push individual modules
- Pull all modules
- Pull selected modules with QuickPick
- Smart Sync feature
- File watcher for auto-refresh
- Environment configuration
- Output channel logging
