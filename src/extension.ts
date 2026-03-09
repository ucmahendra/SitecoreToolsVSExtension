import * as vscode from "vscode";
import { ModulesTreeProvider } from "./providers/modulesTreeProvider";
import { CliCommandsTreeProvider } from "./providers/cliCommandsTreeProvider";
import { PullModuleCommand } from "./commands/pullModuleCommand";
import { PushModuleCommand } from "./commands/pushModuleCommand";
import { PullAllModulesCommand } from "./commands/pullAllModulesCommand";
import { PullSelectedModulesCommand } from "./commands/pullSelectedModulesCommand";
import { SmartSyncCommand } from "./commands/smartSyncCommand";
import {
  LoginCommand,
  LogoutCommand,
  CheckLoginStatusCommand,
} from "./commands/loginCommand";
import { CreateModuleCommand } from "./commands/createModuleCommand";
import {
  PullCheckedModulesCommand,
  PushCheckedModulesCommand,
  SelectAllModulesCommand,
  DeselectAllModulesCommand,
} from "./commands/pullCheckedModulesCommand";
import { InitCommand } from "./commands/initCommand";
import {
  PluginAddCommand,
  PluginRemoveCommand,
  PluginListCommand,
} from "./commands/pluginCommand";
import { PublishCommand, PublishSiteCommand } from "./commands/publishCommand";
import {
  IndexRebuildCommand,
  IndexPopulateCommand,
  IndexSchemaPopulateCommand,
} from "./commands/indexCommand";
import {
  PackageCreateCommand,
  SerPackageCreateCommand,
  SerPackageInstallCommand,
} from "./commands/packageCommand";
import {
  CloudProjectListCommand,
  CloudEnvironmentListCommand,
  CloudDeploymentCreateCommand,
  CloudDeploymentListCommand,
  ConnectCommand,
} from "./commands/cloudCommand";
import { ConfigService } from "./services/configService";
import { LoginService } from "./services/loginService";
import { Logger } from "./utils/logger";
import { TerminalRunner } from "./utils/terminalRunner";
import { LoginStatusBarItem } from "./ui/loginStatusBarItem";

let modulesTreeProvider: ModulesTreeProvider;
let cliCommandsTreeProvider: CliCommandsTreeProvider;
let fileWatcher: vscode.FileSystemWatcher;
let loginStatusBarItem: LoginStatusBarItem;

export function activate(context: vscode.ExtensionContext): void {
  Logger.initialize();
  Logger.info("Sitecore DevTools extension is activating...");

  modulesTreeProvider = new ModulesTreeProvider();
  cliCommandsTreeProvider = new CliCommandsTreeProvider();

  const treeView = vscode.window.createTreeView("serializationModules", {
    treeDataProvider: modulesTreeProvider,
    showCollapseAll: false,
    manageCheckboxStateManually: true,
  });

  treeView.onDidChangeCheckboxState((e) => {
    e.items.forEach(([item, state]) => {
      modulesTreeProvider.handleCheckboxChange(item, state);
    });
  });

  const cliCommandsTreeView = vscode.window.createTreeView(
    "sitecoreCliCommands",
    {
      treeDataProvider: cliCommandsTreeProvider,
      showCollapseAll: true,
    },
  );

  context.subscriptions.push(treeView);
  context.subscriptions.push(cliCommandsTreeView);

  const pullModuleCommand = new PullModuleCommand();
  const pushModuleCommand = new PushModuleCommand();
  const pullAllModulesCommand = new PullAllModulesCommand(modulesTreeProvider);
  const pullSelectedModulesCommand = new PullSelectedModulesCommand(
    modulesTreeProvider,
  );
  const smartSyncCommand = new SmartSyncCommand(modulesTreeProvider);
  const loginCommand = new LoginCommand();
  const logoutCommand = new LogoutCommand();
  const checkLoginStatusCommand = new CheckLoginStatusCommand();
  const createModuleCommand = new CreateModuleCommand();
  const pullCheckedModulesCommand = new PullCheckedModulesCommand(
    modulesTreeProvider,
  );
  const pushCheckedModulesCommand = new PushCheckedModulesCommand(
    modulesTreeProvider,
  );
  const selectAllModulesCommand = new SelectAllModulesCommand(
    modulesTreeProvider,
  );
  const deselectAllModulesCommand = new DeselectAllModulesCommand(
    modulesTreeProvider,
  );

  // New CLI commands
  const initCommand = new InitCommand();
  const pluginAddCommand = new PluginAddCommand();
  const pluginRemoveCommand = new PluginRemoveCommand();
  const pluginListCommand = new PluginListCommand();
  const publishCommand = new PublishCommand();
  const publishSiteCommand = new PublishSiteCommand();
  const indexRebuildCommand = new IndexRebuildCommand();
  const indexPopulateCommand = new IndexPopulateCommand();
  const indexSchemaPopulateCommand = new IndexSchemaPopulateCommand();
  const packageCreateCommand = new PackageCreateCommand();
  const serPackageCreateCommand = new SerPackageCreateCommand();
  const serPackageInstallCommand = new SerPackageInstallCommand();
  const cloudProjectListCommand = new CloudProjectListCommand();
  const cloudEnvironmentListCommand = new CloudEnvironmentListCommand();
  const cloudDeploymentCreateCommand = new CloudDeploymentCreateCommand();
  const cloudDeploymentListCommand = new CloudDeploymentListCommand();
  const connectCommand = new ConnectCommand();

  // Initialize login status bar
  loginStatusBarItem = new LoginStatusBarItem();
  context.subscriptions.push({ dispose: () => loginStatusBarItem.dispose() });

  // Check login status on startup
  LoginService.checkLoginStatus().catch((err) => {
    Logger.warn("Failed to check login status on startup: " + err.message);
  });

  context.subscriptions.push(
    vscode.commands.registerCommand("sitecoreDevtools.refreshModules", () => {
      modulesTreeProvider.refresh();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sitecoreDevtools.pullModule", (item) => {
      pullModuleCommand.execute(item);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sitecoreDevtools.pushModule", (item) => {
      pushModuleCommand.execute(item);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sitecoreDevtools.pullAllModules", () => {
      pullAllModulesCommand.execute();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "sitecoreDevtools.pullSelectedModules",
      () => {
        pullSelectedModulesCommand.execute();
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sitecoreDevtools.smartSync", () => {
      smartSyncCommand.execute();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sitecoreDevtools.login", () => {
      loginCommand.execute();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sitecoreDevtools.logout", () => {
      logoutCommand.execute();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sitecoreDevtools.checkLoginStatus", () => {
      checkLoginStatusCommand.execute();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sitecoreDevtools.createModule", () => {
      createModuleCommand.execute();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "sitecoreDevtools.pullCheckedModules",
      () => {
        pullCheckedModulesCommand.execute();
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "sitecoreDevtools.pushCheckedModules",
      () => {
        pushCheckedModulesCommand.execute();
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sitecoreDevtools.selectAllModules", () => {
      selectAllModulesCommand.execute();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "sitecoreDevtools.deselectAllModules",
      () => {
        deselectAllModulesCommand.execute();
      },
    ),
  );

  // Register new CLI commands
  context.subscriptions.push(
    vscode.commands.registerCommand("sitecoreDevtools.init", () => {
      initCommand.execute();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sitecoreDevtools.pluginAdd", () => {
      pluginAddCommand.execute();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sitecoreDevtools.pluginRemove", () => {
      pluginRemoveCommand.execute();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sitecoreDevtools.pluginList", () => {
      pluginListCommand.execute();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sitecoreDevtools.publish", () => {
      publishCommand.execute();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sitecoreDevtools.publishSite", () => {
      publishSiteCommand.execute();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sitecoreDevtools.indexRebuild", () => {
      indexRebuildCommand.execute();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sitecoreDevtools.indexPopulate", () => {
      indexPopulateCommand.execute();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "sitecoreDevtools.indexSchemaPopulate",
      () => {
        indexSchemaPopulateCommand.execute();
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sitecoreDevtools.packageCreate", () => {
      packageCreateCommand.execute();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sitecoreDevtools.serPackageCreate", () => {
      serPackageCreateCommand.execute();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "sitecoreDevtools.serPackageInstall",
      () => {
        serPackageInstallCommand.execute();
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sitecoreDevtools.cloudProjectList", () => {
      cloudProjectListCommand.execute();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "sitecoreDevtools.cloudEnvironmentList",
      () => {
        cloudEnvironmentListCommand.execute();
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "sitecoreDevtools.cloudDeploymentCreate",
      () => {
        cloudDeploymentCreateCommand.execute();
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "sitecoreDevtools.cloudDeploymentList",
      () => {
        cloudDeploymentListCommand.execute();
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sitecoreDevtools.connect", () => {
      connectCommand.execute();
    }),
  );

  setupFileWatcher(context);

  modulesTreeProvider
    .refresh()
    .then(() => {
      Logger.info("Initial module scan complete");
    })
    .catch((err) => {
      Logger.error("Failed to scan modules on startup", err);
    });

  Logger.show();
  Logger.info("Sitecore DevTools extension activated successfully");
  Logger.info(`Environment: ${ConfigService.getEnvironment()}`);
}

function setupFileWatcher(context: vscode.ExtensionContext): void {
  fileWatcher = vscode.workspace.createFileSystemWatcher("**/module.json");

  fileWatcher.onDidCreate(() => {
    if (ConfigService.getAutoRefreshModules()) {
      Logger.info("New module.json detected, refreshing modules...");
      modulesTreeProvider.refresh();
    }
  });

  fileWatcher.onDidDelete(() => {
    if (ConfigService.getAutoRefreshModules()) {
      Logger.info("module.json deleted, refreshing modules...");
      modulesTreeProvider.refresh();
    }
  });

  fileWatcher.onDidChange(() => {
    if (ConfigService.getAutoRefreshModules()) {
      Logger.info("module.json changed, refreshing modules...");
      modulesTreeProvider.refresh();
    }
  });

  context.subscriptions.push(fileWatcher);
}

export function deactivate(): void {
  Logger.info("Sitecore DevTools extension is deactivating...");
  TerminalRunner.dispose();
  Logger.dispose();
}
