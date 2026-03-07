import { ConfigService } from "./configService";
import { TerminalRunner } from "../utils/terminalRunner";
import { Logger } from "../utils/logger";

export class SitecoreCliService {
  public pullModule(moduleName: string): void {
    const environment = ConfigService.getEnvironment();
    const command = `dotnet sitecore serialization pull --include "${moduleName}" --environment-name "${environment}"`;

    Logger.info(`Pulling module: ${moduleName}`);
    TerminalRunner.runCommand(command);
  }

  public pushModule(moduleName: string): void {
    const environment = ConfigService.getEnvironment();
    const command = `dotnet sitecore serialization push --include "${moduleName}" --environment-name "${environment}"`;

    Logger.info(`Pushing module: ${moduleName}`);
    TerminalRunner.runCommand(command);
  }

  public pullAllModules(moduleNames: string[]): void {
    const environment = ConfigService.getEnvironment();
    const command = `dotnet sitecore serialization pull --environment-name "${environment}"`;

    Logger.info(`Pulling all modules: ${moduleNames.join(", ")}`);
    TerminalRunner.runCommand(command);
  }

  public pullModules(moduleNames: string[]): void {
    const environment = ConfigService.getEnvironment();
    const includeArgs = moduleNames.map((m) => `--include "${m}"`).join(" ");
    const command = `dotnet sitecore serialization pull ${includeArgs} --environment-name "${environment}"`;

    Logger.info(`Pulling modules: ${moduleNames.join(", ")}`);
    TerminalRunner.runCommand(command);
  }

  public pushModules(moduleNames: string[]): void {
    const environment = ConfigService.getEnvironment();
    const includeArgs = moduleNames.map((m) => `--include "${m}"`).join(" ");
    const command = `dotnet sitecore serialization push ${includeArgs} --environment-name "${environment}"`;

    Logger.info(`Pushing modules: ${moduleNames.join(", ")}`);
    TerminalRunner.runCommand(command);
  }

  public async getSerializationStatus(): Promise<string> {
    const environment = ConfigService.getEnvironment();
    const command = `dotnet sitecore serialization pull --what-if --environment-name "${environment}"`;

    Logger.info("Getting serialization status");
    return TerminalRunner.runCommandWithOutput(command);
  }
}
