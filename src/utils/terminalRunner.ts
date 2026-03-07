import * as vscode from "vscode";
import { exec } from "child_process";
import { Logger } from "./logger";

export class TerminalRunner {
  private static terminal: vscode.Terminal | undefined;
  private static readonly TERMINAL_NAME = "Sitecore CLI";

  public static runCommand(command: string): void {
    Logger.command(command);

    const terminal = this.getOrCreateTerminal();
    terminal.show();
    terminal.sendText(command);
  }

  public static runCommandWithOutput(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const workspaceFolder =
        vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

      if (!workspaceFolder) {
        reject(new Error("No workspace folder found"));
        return;
      }

      Logger.command(command);

      exec(
        command,
        { cwd: workspaceFolder },
        (error: Error | null, stdout: string, stderr: string) => {
          if (error) {
            Logger.error(`Command failed: ${command}`, error);
            reject(error);
            return;
          }

          if (stderr) {
            Logger.warn(stderr);
          }

          resolve(stdout);
        },
      );
    });
  }

  private static getOrCreateTerminal(): vscode.Terminal {
    if (this.terminal && this.isTerminalAlive(this.terminal)) {
      return this.terminal;
    }

    this.terminal = vscode.window.createTerminal({
      name: this.TERMINAL_NAME,
      cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
    });

    vscode.window.onDidCloseTerminal((closedTerminal) => {
      if (closedTerminal === this.terminal) {
        this.terminal = undefined;
      }
    });

    return this.terminal;
  }

  private static isTerminalAlive(terminal: vscode.Terminal): boolean {
    return vscode.window.terminals.includes(terminal);
  }

  public static dispose(): void {
    this.terminal?.dispose();
    this.terminal = undefined;
  }
}
