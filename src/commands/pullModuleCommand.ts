import * as vscode from "vscode";
import { ModuleTreeItem } from "../ui/moduleTreeItem";
import { SitecoreCliService } from "../services/sitecoreCliService";
import { Logger } from "../utils/logger";

export class PullModuleCommand {
  private sitecoreCliService: SitecoreCliService;

  constructor() {
    this.sitecoreCliService = new SitecoreCliService();
  }

  public async execute(item?: ModuleTreeItem): Promise<void> {
    if (!item) {
      vscode.window.showWarningMessage("No module selected");
      return;
    }

    const moduleName = item.module.name;
    const dependencies = item.module.references || [];

    try {
      Logger.info(`Executing pull for module: ${moduleName}`);
      if (dependencies.length > 0) {
        Logger.info(`Including dependencies: ${dependencies.join(", ")}`);
      }
      this.sitecoreCliService.pullModule(moduleName, dependencies);
      const message =
        dependencies.length > 0
          ? `Pulling module: ${moduleName} (with ${dependencies.length} dependencies)`
          : `Pulling module: ${moduleName}`;
      vscode.window.showInformationMessage(message);
    } catch (error) {
      Logger.error(`Failed to pull module: ${moduleName}`, error as Error);
      vscode.window.showErrorMessage(`Failed to pull module: ${moduleName}`);
    }
  }
}
