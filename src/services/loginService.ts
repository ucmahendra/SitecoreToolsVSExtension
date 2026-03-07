import * as vscode from "vscode";
import { ConfigService } from "./configService";
import { TerminalRunner } from "../utils/terminalRunner";
import { Logger } from "../utils/logger";

export interface LoginOptions {
  clientId?: string;
  clientSecret?: string;
  clientCredentialsLogin?: boolean;
  deviceCodeAuth?: boolean;
  allowWrite?: boolean;
  environmentName?: string;
  authority?: string;
  audience?: string;
}

export class LoginService {
  private static _isLoggedIn: boolean = false;
  private static _onLoginStatusChanged: vscode.EventEmitter<boolean> =
    new vscode.EventEmitter<boolean>();
  public static readonly onLoginStatusChanged: vscode.Event<boolean> =
    LoginService._onLoginStatusChanged.event;

  public static get isLoggedIn(): boolean {
    return this._isLoggedIn;
  }

  public static setLoginStatus(status: boolean): void {
    this._isLoggedIn = status;
    this._onLoginStatusChanged.fire(status);
  }

  public static async login(options?: LoginOptions): Promise<void> {
    const config = ConfigService.getLoginConfig();
    const mergedOptions: LoginOptions = { ...config, ...options };

    let command = "dotnet sitecore cloud login";

    if (mergedOptions.clientCredentialsLogin) {
      command += " --client-credentials";
      if (mergedOptions.clientId) {
        command += ` --client-id "${mergedOptions.clientId}"`;
      }
      if (mergedOptions.clientSecret) {
        command += ` --client-secret "${mergedOptions.clientSecret}"`;
      }
    } else if (mergedOptions.deviceCodeAuth) {
      command += " --device-code";
    }

    if (mergedOptions.allowWrite) {
      command += " --allow-write";
    }

    if (mergedOptions.authority) {
      command += ` --authority "${mergedOptions.authority}"`;
    }

    if (mergedOptions.audience) {
      command += ` --audience "${mergedOptions.audience}"`;
    }

    Logger.info("Executing Sitecore login...");
    TerminalRunner.runCommand(command);
  }

  public static async loginWithPrompt(): Promise<void> {
    const config = ConfigService.getLoginConfig();

    const loginMethod = await vscode.window.showQuickPick(
      [
        {
          label: "$(browser) Interactive Login",
          description: "Login via browser (default)",
          value: "interactive",
        },
        {
          label: "$(key) Device Code",
          description: "Login using device code authentication",
          value: "deviceCode",
        },
        {
          label: "$(lock) Client Credentials",
          description: "Login using client ID and secret",
          value: "clientCredentials",
        },
      ],
      {
        placeHolder: "Select login method",
        title: "Sitecore Login",
      },
    );

    if (!loginMethod) {
      return;
    }

    const options: LoginOptions = {};

    if (loginMethod.value === "deviceCode") {
      options.deviceCodeAuth = true;
    } else if (loginMethod.value === "clientCredentials") {
      options.clientCredentialsLogin = true;

      const clientId = await vscode.window.showInputBox({
        prompt: "Enter Client ID",
        value: config.clientId || "",
        placeHolder: "Client ID",
      });

      if (!clientId) {
        return;
      }
      options.clientId = clientId;

      const clientSecret = await vscode.window.showInputBox({
        prompt: "Enter Client Secret",
        password: true,
        placeHolder: "Client Secret",
      });

      if (!clientSecret) {
        return;
      }
      options.clientSecret = clientSecret;
    }

    const allowWrite = await vscode.window.showQuickPick(
      [
        { label: "Yes", description: "Allow write operations", value: true },
        { label: "No", description: "Read-only access", value: false },
      ],
      {
        placeHolder: "Allow write operations?",
        title: "Write Permission",
      },
    );

    if (allowWrite) {
      options.allowWrite = allowWrite.value;
    }

    await this.login(options);
  }

  public static async logout(): Promise<void> {
    const command = "dotnet sitecore cloud logout";
    Logger.info("Executing Sitecore logout...");
    TerminalRunner.runCommand(command);
    this.setLoginStatus(false);
  }

  public static async checkLoginStatus(): Promise<boolean> {
    try {
      // Use 'dotnet sitecore cloud project list' to check if logged in
      // If not logged in, it will fail or show authentication error
      const output = await TerminalRunner.runCommandWithOutput(
        "dotnet sitecore cloud project list",
      );
      const isLoggedIn =
        !output.toLowerCase().includes("not logged in") &&
        !output.toLowerCase().includes("please login") &&
        !output.toLowerCase().includes("authentication") &&
        !output.toLowerCase().includes("unauthorized") &&
        !output.toLowerCase().includes("error");
      this.setLoginStatus(isLoggedIn);
      return isLoggedIn;
    } catch {
      // Command failed - assume not logged in
      this.setLoginStatus(false);
      return false;
    }
  }
}
