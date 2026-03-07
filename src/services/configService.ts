import * as vscode from "vscode";

export interface LoginConfig {
  clientId?: string;
  clientCredentialsLogin?: boolean;
  deviceCodeAuth?: boolean;
  allowWrite?: boolean;
  authority?: string;
  audience?: string;
}

export interface ModuleConfig {
  namespace: string;
  name: string;
  serializationPath?: string;
  includes?: ModuleIncludeConfig[];
}

export interface ModuleIncludeConfig {
  name: string;
  path: string;
  scope?:
    | "SingleItem"
    | "ItemAndChildren"
    | "ItemAndDescendants"
    | "DescendantsOnly";
  allowedPushOperations?: ("CreateAndUpdate" | "CreateOnly" | "UpdateOnly")[];
  database?: string;
}

export class ConfigService {
  private static readonly CONFIG_SECTION = "sitecoreDevtools";

  public static getEnvironment(): string {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
    return config.get<string>("environment", "dev");
  }

  public static getAutoRefreshModules(): boolean {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
    return config.get<boolean>("autoRefreshModules", true);
  }

  public static async setEnvironment(environment: string): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
    await config.update(
      "environment",
      environment,
      vscode.ConfigurationTarget.Workspace,
    );
  }

  public static async setAutoRefreshModules(
    autoRefresh: boolean,
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
    await config.update(
      "autoRefreshModules",
      autoRefresh,
      vscode.ConfigurationTarget.Workspace,
    );
  }

  public static getLoginConfig(): LoginConfig {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
    return {
      clientId: config.get<string>("login.clientId"),
      clientCredentialsLogin: config.get<boolean>(
        "login.clientCredentialsLogin",
        false,
      ),
      deviceCodeAuth: config.get<boolean>("login.deviceCodeAuth", false),
      allowWrite: config.get<boolean>("login.allowWrite", true),
      authority: config.get<string>("login.authority"),
      audience: config.get<string>("login.audience"),
    };
  }

  public static async setLoginConfig(
    loginConfig: Partial<LoginConfig>,
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
    if (loginConfig.clientId !== undefined) {
      await config.update(
        "login.clientId",
        loginConfig.clientId,
        vscode.ConfigurationTarget.Workspace,
      );
    }
    if (loginConfig.clientCredentialsLogin !== undefined) {
      await config.update(
        "login.clientCredentialsLogin",
        loginConfig.clientCredentialsLogin,
        vscode.ConfigurationTarget.Workspace,
      );
    }
    if (loginConfig.deviceCodeAuth !== undefined) {
      await config.update(
        "login.deviceCodeAuth",
        loginConfig.deviceCodeAuth,
        vscode.ConfigurationTarget.Workspace,
      );
    }
    if (loginConfig.allowWrite !== undefined) {
      await config.update(
        "login.allowWrite",
        loginConfig.allowWrite,
        vscode.ConfigurationTarget.Workspace,
      );
    }
    if (loginConfig.authority !== undefined) {
      await config.update(
        "login.authority",
        loginConfig.authority,
        vscode.ConfigurationTarget.Workspace,
      );
    }
    if (loginConfig.audience !== undefined) {
      await config.update(
        "login.audience",
        loginConfig.audience,
        vscode.ConfigurationTarget.Workspace,
      );
    }
  }

  public static getDefaultModuleConfig(): ModuleConfig {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
    return {
      namespace: config.get<string>("module.defaultNamespace", ""),
      name: config.get<string>("module.defaultName", ""),
      serializationPath: config.get<string>(
        "module.defaultSerializationPath",
        "items",
      ),
    };
  }
}
