# Sitecore DevTools

A VS Code extension that provides a GUI interface for Sitecore CLI serialization modules, removing the need to manually run CLI commands.

## Features

### Serialization

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

### Project Setup

- **Initialize Project**: Run `dotnet sitecore init` to set up a new Sitecore CLI project
- **Connect to Environment**: Connect to XM Cloud or on-premise Sitecore instances

### Plugin Management

- **Add Plugin**: Install Sitecore CLI plugins (Serialization, Publishing, Indexing, ResourcePackage)
- **Remove Plugin**: Uninstall Sitecore CLI plugins
- **List Plugins**: View all installed plugins

### Publishing

- **Publish**: Execute publish operations with configurable options (smart/full/incremental)
- **Publish Site**: Publish a specific site

### Indexing

- **Rebuild Index**: Rebuild search indexes
- **Populate Index**: Populate search indexes
- **Populate Index Schema**: Populate index schemas

### Packages

- **Create Item Resource Package**: Create item resource packages using `dotnet sitecore itemres`
- **Create Serialization Package**: Create serialization packages
- **Install Serialization Package**: Install serialization packages to Sitecore

### XM Cloud

- **List Projects**: View XM Cloud projects
- **List Environments**: View XM Cloud environments
- **Create Deployment**: Create new XM Cloud deployments
- **List Deployments**: View deployment history

## Screenshots

![Sitecore DevTools Panel](images/panel-placeholder.png)
_Sitecore DevTools Activity Bar with Serialization Modules TreeView_

![Context Menu](images/context-menu-placeholder.png)
_Right-click context menu for Pull/Push operations_

![Smart Sync](images/smart-sync-placeholder.png)
_Smart Sync detecting and pulling changed modules_

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

### Serialization Commands

| Command                                | Description                               |
| -------------------------------------- | ----------------------------------------- |
| `sitecoreDevtools.refreshModules`      | Refresh the modules list                  |
| `sitecoreDevtools.pullModule`          | Pull a specific module                    |
| `sitecoreDevtools.pushModule`          | Push a specific module                    |
| `sitecoreDevtools.pullAllModules`      | Pull all detected modules                 |
| `sitecoreDevtools.pullSelectedModules` | Open QuickPick to select and pull modules |
| `sitecoreDevtools.smartSync`           | Detect and pull changed modules           |
| `sitecoreDevtools.createModule`        | Create a new serialization module         |

### Project Setup Commands

| Command                    | Description                           |
| -------------------------- | ------------------------------------- |
| `sitecoreDevtools.init`    | Initialize a new Sitecore CLI project |
| `sitecoreDevtools.connect` | Connect to a Sitecore environment     |

### Authentication Commands

| Command                             | Description                |
| ----------------------------------- | -------------------------- |
| `sitecoreDevtools.login`            | Login to Sitecore          |
| `sitecoreDevtools.logout`           | Logout from Sitecore       |
| `sitecoreDevtools.checkLoginStatus` | Check current login status |

### Plugin Commands

| Command                         | Description                  |
| ------------------------------- | ---------------------------- |
| `sitecoreDevtools.pluginAdd`    | Add a Sitecore CLI plugin    |
| `sitecoreDevtools.pluginRemove` | Remove a Sitecore CLI plugin |
| `sitecoreDevtools.pluginList`   | List installed plugins       |

### Publishing Commands

| Command                        | Description                  |
| ------------------------------ | ---------------------------- |
| `sitecoreDevtools.publish`     | Publish content with options |
| `sitecoreDevtools.publishSite` | Publish a specific site      |

### Indexing Commands

| Command                                | Description           |
| -------------------------------------- | --------------------- |
| `sitecoreDevtools.indexRebuild`        | Rebuild search index  |
| `sitecoreDevtools.indexPopulate`       | Populate search index |
| `sitecoreDevtools.indexSchemaPopulate` | Populate index schema |

### Package Commands

| Command                              | Description                   |
| ------------------------------------ | ----------------------------- |
| `sitecoreDevtools.packageCreate`     | Create item resource package  |
| `sitecoreDevtools.serPackageCreate`  | Create serialization package  |
| `sitecoreDevtools.serPackageInstall` | Install serialization package |

### XM Cloud Commands

| Command                                  | Description                |
| ---------------------------------------- | -------------------------- |
| `sitecoreDevtools.cloudProjectList`      | List XM Cloud projects     |
| `sitecoreDevtools.cloudEnvironmentList`  | List XM Cloud environments |
| `sitecoreDevtools.cloudDeploymentCreate` | Create XM Cloud deployment |
| `sitecoreDevtools.cloudDeploymentList`   | List XM Cloud deployments  |

## Extension Settings

| Setting                               | Type    | Default | Description                                                 |
| ------------------------------------- | ------- | ------- | ----------------------------------------------------------- |
| `sitecoreDevtools.environment`        | string  | `dev`   | The Sitecore environment to use for CLI commands            |
| `sitecoreDevtools.autoRefreshModules` | boolean | `true`  | Automatically refresh modules when module.json files change |

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
# Initialize project
dotnet sitecore init

# Pull module
dotnet sitecore serialization pull --include <ModuleName> --environment-name <env>

# Push module
dotnet sitecore serialization push --include <ModuleName> --environment-name <env>

# Pull multiple modules
dotnet sitecore serialization pull --include <Module1> --include <Module2> --environment-name <env>

# Get serialization status (for Smart Sync)
dotnet sitecore serialization pull --what-if --environment-name <env>

# Plugin management
dotnet sitecore plugin add -n <PluginName>
dotnet sitecore plugin remove -n <PluginName>
dotnet sitecore plugin list

# Publishing
dotnet sitecore publish --environment-name <env>
dotnet sitecore publish --environment-name <env> --site <siteName>

# Indexing
dotnet sitecore index rebuild --environment-name <env>
dotnet sitecore index populate --environment-name <env>
dotnet sitecore index schema-populate --environment-name <env>

# Packages
dotnet sitecore itemres create -o <outputPath>
dotnet sitecore ser package create -o <outputPath>
dotnet sitecore ser package install -p <packagePath> --environment-name <env>

# XM Cloud
dotnet sitecore cloud login
dotnet sitecore cloud logout
dotnet sitecore cloud project list
dotnet sitecore cloud environment list
dotnet sitecore cloud deployment create --environment-id <envId>
dotnet sitecore cloud deployment list
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

### 1.1.0

- Added CLI Commands tree view in sidebar
- Added Initialize Project command (`dotnet sitecore init`)
- Added Connect to Environment command
- Added Plugin management (add, remove, list)
- Added Publishing commands (publish, publish site)
- Added Indexing commands (rebuild, populate, schema-populate)
- Added Package commands (itemres create, ser package create/install)
- Added XM Cloud commands (project list, environment list, deployment create/list)

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
