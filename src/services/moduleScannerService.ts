import * as vscode from "vscode";
import * as path from "path";
import { Module, ModuleJson, SitecoreJson } from "../models/module";
import { Logger } from "../utils/logger";

export class ModuleScannerService {
  public async scanModules(): Promise<Module[]> {
    const modules: Module[] = [];

    try {
      Logger.info("Scanning for modules...");
      Logger.info(
        `Workspace folders: ${vscode.workspace.workspaceFolders?.map((f) => f.uri.fsPath).join(", ") || "None"}`,
      );

      const sitecoreJsonFiles = await vscode.workspace.findFiles(
        "**/sitecore.json",
        "**/node_modules/**",
      );

      if (sitecoreJsonFiles.length > 0) {
        Logger.info(`Found ${sitecoreJsonFiles.length} sitecore.json file(s)`);

        for (const sitecoreJsonUri of sitecoreJsonFiles) {
          const foundModules =
            await this.scanModulesFromSitecoreJson(sitecoreJsonUri);
          modules.push(...foundModules);
        }
      } else {
        Logger.info(
          "No sitecore.json found, falling back to scanning for module.json files...",
        );
        const moduleFiles = await vscode.workspace.findFiles(
          "**/module.json",
          "**/node_modules/**",
        );

        Logger.info(`Found ${moduleFiles.length} module.json file(s)`);

        for (const file of moduleFiles) {
          Logger.info(`  - ${file.fsPath}`);
        }

        for (const fileUri of moduleFiles) {
          const module = await this.parseModuleFile(fileUri);
          if (module) {
            modules.push(module);
          }
        }
      }

      Logger.modules(modules.map((m) => m.name));
    } catch (error) {
      Logger.error("Error scanning modules", error as Error);
    }

    return modules;
  }

  private async scanModulesFromSitecoreJson(
    sitecoreJsonUri: vscode.Uri,
  ): Promise<Module[]> {
    const modules: Module[] = [];

    try {
      const content = await vscode.workspace.fs.readFile(sitecoreJsonUri);
      // Handle different encodings and strip BOM if present
      const contentStr = this.decodeContent(content);
      const sitecoreJson: SitecoreJson = JSON.parse(contentStr);
      const sitecoreJsonDir = path.dirname(sitecoreJsonUri.fsPath);

      Logger.info(`Parsing sitecore.json at: ${sitecoreJsonUri.fsPath}`);

      if (sitecoreJson.modules && sitecoreJson.modules.length > 0) {
        Logger.info(`Module patterns: ${sitecoreJson.modules.join(", ")}`);

        for (const modulePattern of sitecoreJson.modules) {
          const moduleFiles = await vscode.workspace.findFiles(
            new vscode.RelativePattern(sitecoreJsonDir, modulePattern),
            "**/node_modules/**",
          );

          Logger.info(
            `Pattern "${modulePattern}" matched ${moduleFiles.length} file(s)`,
          );

          for (const file of moduleFiles) {
            Logger.info(`  - ${file.fsPath}`);
          }

          for (const moduleFileUri of moduleFiles) {
            const module = await this.parseModuleFile(moduleFileUri);
            if (module) {
              modules.push(module);
            }
          }
        }
      } else {
        Logger.warn("No module patterns found in sitecore.json");
      }
    } catch (error) {
      Logger.error(
        `Error parsing sitecore.json: ${sitecoreJsonUri.fsPath}`,
        error as Error,
      );
    }

    return modules;
  }

  private async parseModuleFile(fileUri: vscode.Uri): Promise<Module | null> {
    try {
      const content = await vscode.workspace.fs.readFile(fileUri);
      // Handle different encodings and strip BOM if present
      const contentStr = this.decodeContent(content);
      const moduleJson: ModuleJson = JSON.parse(contentStr);

      const moduleName =
        moduleJson.namespace ||
        moduleJson.name ||
        path.basename(path.dirname(fileUri.fsPath));
      const modulePath = fileUri.fsPath;
      const folder = path.dirname(fileUri.fsPath);

      const includePaths: string[] = [];
      if (moduleJson.items?.includes) {
        for (const include of moduleJson.items.includes) {
          if (include.path) {
            includePaths.push(include.path);
          }
        }
      }

      const references: string[] = moduleJson.references || [];

      return {
        name: moduleName,
        path: modulePath,
        folder: folder,
        includePaths: includePaths,
        references: references,
      };
    } catch (error) {
      Logger.error(
        `Error parsing module file: ${fileUri.fsPath}`,
        error as Error,
      );
      return null;
    }
  }

  private decodeContent(content: Uint8Array): string {
    // Check for UTF-16 LE BOM (FF FE)
    if (content.length >= 2 && content[0] === 0xff && content[1] === 0xfe) {
      const decoder = new TextDecoder("utf-16le");
      return decoder.decode(content).replace(/^\uFEFF/, "");
    }
    // Check for UTF-16 BE BOM (FE FF)
    if (content.length >= 2 && content[0] === 0xfe && content[1] === 0xff) {
      const decoder = new TextDecoder("utf-16be");
      return decoder.decode(content).replace(/^\uFEFF/, "");
    }
    // Default to UTF-8 and strip BOM if present
    return content.toString().replace(/^\uFEFF/, "");
  }
}
