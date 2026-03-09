import { ConfigService } from "./configService";
import { TerminalRunner } from "../utils/terminalRunner";
import { Logger } from "../utils/logger";

export class SitecoreCliService {
  private getEnvironmentArg(): string {
    const environment = ConfigService.getEnvironment();
    return environment ? ` --environment-name "${environment}"` : "";
  }

  public pullModule(moduleName: string, dependencies: string[] = []): void {
    const allModules = [moduleName, ...dependencies];
    const includeArgs = allModules.map((m) => `--include "${m}"`).join(" ");
    const command = `dotnet sitecore serialization pull ${includeArgs}${this.getEnvironmentArg()}`;

    Logger.info(
      `Pulling module: ${moduleName}${dependencies.length > 0 ? ` (with dependencies: ${dependencies.join(", ")})` : ""}`,
    );
    TerminalRunner.runCommand(command);
  }

  public pushModule(moduleName: string): void {
    const command = `dotnet sitecore serialization push --include "${moduleName}"${this.getEnvironmentArg()}`;

    Logger.info(`Pushing module: ${moduleName}`);
    TerminalRunner.runCommand(command);
  }

  public pullAllModules(moduleNames: string[]): void {
    const command = `dotnet sitecore serialization pull${this.getEnvironmentArg()}`;

    Logger.info(`Pulling all modules: ${moduleNames.join(", ")}`);
    TerminalRunner.runCommand(command);
  }

  public pullModules(moduleNames: string[]): void {
    const includeArgs = moduleNames.map((m) => `--include "${m}"`).join(" ");
    const command = `dotnet sitecore serialization pull ${includeArgs}${this.getEnvironmentArg()}`;

    Logger.info(`Pulling modules: ${moduleNames.join(", ")}`);
    TerminalRunner.runCommand(command);
  }

  public pushModules(moduleNames: string[]): void {
    const includeArgs = moduleNames.map((m) => `--include "${m}"`).join(" ");
    const command = `dotnet sitecore serialization push ${includeArgs}${this.getEnvironmentArg()}`;

    Logger.info(`Pushing modules: ${moduleNames.join(", ")}`);
    TerminalRunner.runCommand(command);
  }

  public async getSerializationStatus(): Promise<string> {
    const command = `dotnet sitecore serialization pull --what-if${this.getEnvironmentArg()}`;

    Logger.info("Getting serialization status");
    return TerminalRunner.runCommandWithOutput(command);
  }
}
