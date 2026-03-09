import * as vscode from 'vscode';
import { TerminalRunner } from '../utils/terminalRunner';
import { Logger } from '../utils/logger';

export class CloudProjectListCommand {
    public async execute(): Promise<void> {
        try {
            Logger.info('Executing cloud project list command...');
            const command = 'dotnet sitecore cloud project list';
            TerminalRunner.runCommand(command);
        } catch (error) {
            Logger.error('Cloud project list command failed', error as Error);
            vscode.window.showErrorMessage('Failed to list cloud projects');
        }
    }
}

export class CloudEnvironmentListCommand {
    public async execute(): Promise<void> {
        try {
            Logger.info('Executing cloud environment list command...');

            const projectId = await vscode.window.showInputBox({
                prompt: 'Enter project ID (optional, leave empty for all)',
                placeHolder: 'Project ID'
            });

            let command = 'dotnet sitecore cloud environment list';
            if (projectId) {
                command += ` --project-id "${projectId}"`;
            }

            TerminalRunner.runCommand(command);
        } catch (error) {
            Logger.error('Cloud environment list command failed', error as Error);
            vscode.window.showErrorMessage('Failed to list cloud environments');
        }
    }
}

export class CloudDeploymentCreateCommand {
    public async execute(): Promise<void> {
        try {
            Logger.info('Executing cloud deployment create command...');

            const environmentId = await vscode.window.showInputBox({
                prompt: 'Enter environment ID',
                placeHolder: 'Environment ID',
                validateInput: (value) => {
                    if (!value || value.trim().length === 0) {
                        return 'Environment ID is required';
                    }
                    return undefined;
                }
            });

            if (!environmentId) {
                return;
            }

            const uploadOption = await vscode.window.showQuickPick([
                { label: 'Yes', description: 'Upload local changes', value: true },
                { label: 'No', description: 'Deploy without uploading', value: false }
            ], {
                placeHolder: 'Upload local changes?',
                title: 'Cloud Deployment'
            });

            if (!uploadOption) {
                return;
            }

            let command = `dotnet sitecore cloud deployment create --environment-id "${environmentId}"`;
            if (uploadOption.value) {
                command += ' --upload';
            }

            TerminalRunner.runCommand(command);
            vscode.window.showInformationMessage('Cloud deployment started');
        } catch (error) {
            Logger.error('Cloud deployment create command failed', error as Error);
            vscode.window.showErrorMessage('Failed to create cloud deployment');
        }
    }
}

export class CloudDeploymentListCommand {
    public async execute(): Promise<void> {
        try {
            Logger.info('Executing cloud deployment list command...');

            const environmentId = await vscode.window.showInputBox({
                prompt: 'Enter environment ID (optional)',
                placeHolder: 'Environment ID'
            });

            let command = 'dotnet sitecore cloud deployment list';
            if (environmentId) {
                command += ` --environment-id "${environmentId}"`;
            }

            TerminalRunner.runCommand(command);
        } catch (error) {
            Logger.error('Cloud deployment list command failed', error as Error);
            vscode.window.showErrorMessage('Failed to list cloud deployments');
        }
    }
}

export class ConnectCommand {
    public async execute(): Promise<void> {
        try {
            Logger.info('Executing connect command...');

            const options = await this.gatherConnectOptions();
            if (!options) {
                return;
            }

            const command = this.buildConnectCommand(options);
            TerminalRunner.runCommand(command);
            vscode.window.showInformationMessage('Connecting to Sitecore environment...');
        } catch (error) {
            Logger.error('Connect command failed', error as Error);
            vscode.window.showErrorMessage('Failed to connect to Sitecore');
        }
    }

    private async gatherConnectOptions(): Promise<ConnectOptions | undefined> {
        // Environment name
        const environmentName = await vscode.window.showInputBox({
            prompt: 'Enter environment name',
            value: 'default',
            placeHolder: 'e.g., default, dev, staging'
        });

        if (!environmentName) {
            return undefined;
        }

        // Connection type
        const connectionType = await vscode.window.showQuickPick([
            { label: 'XM Cloud', description: 'Connect to XM Cloud environment', value: 'cloud' },
            { label: 'On-Premise / PaaS', description: 'Connect to on-premise or PaaS instance', value: 'onprem' }
        ], {
            placeHolder: 'Select connection type',
            title: 'Connect - Connection Type'
        });

        if (!connectionType) {
            return undefined;
        }

        if (connectionType.value === 'cloud') {
            const projectId = await vscode.window.showInputBox({
                prompt: 'Enter XM Cloud project ID',
                placeHolder: 'Project ID'
            });

            const envId = await vscode.window.showInputBox({
                prompt: 'Enter XM Cloud environment ID',
                placeHolder: 'Environment ID'
            });

            return {
                environmentName,
                isCloud: true,
                projectId: projectId || undefined,
                environmentId: envId || undefined
            };
        } else {
            const cmUrl = await vscode.window.showInputBox({
                prompt: 'Enter CM instance URL',
                placeHolder: 'https://cm.mysite.local',
                validateInput: (value) => {
                    if (!value || !value.startsWith('http')) {
                        return 'Please enter a valid URL starting with http:// or https://';
                    }
                    return undefined;
                }
            });

            if (!cmUrl) {
                return undefined;
            }

            const identityUrl = await vscode.window.showInputBox({
                prompt: 'Enter Identity Server URL',
                placeHolder: 'https://id.mysite.local'
            });

            const allowWrite = await vscode.window.showQuickPick([
                { label: 'Yes', value: true },
                { label: 'No', value: false }
            ], {
                placeHolder: 'Allow write operations?'
            });

            return {
                environmentName,
                isCloud: false,
                cmUrl,
                identityUrl: identityUrl || undefined,
                allowWrite: allowWrite?.value ?? true
            };
        }
    }

    private buildConnectCommand(options: ConnectOptions): string {
        if (options.isCloud) {
            let command = `dotnet sitecore cloud environment connect --environment-name "${options.environmentName}"`;
            if (options.projectId) {
                command += ` --project-id "${options.projectId}"`;
            }
            if (options.environmentId) {
                command += ` --environment-id "${options.environmentId}"`;
            }
            return command;
        } else {
            let command = `dotnet sitecore login --cm "${options.cmUrl}" --environment-name "${options.environmentName}"`;
            if (options.identityUrl) {
                command += ` --authority "${options.identityUrl}"`;
            }
            if (options.allowWrite) {
                command += ' --allow-write';
            }
            return command;
        }
    }
}

interface ConnectOptions {
    environmentName: string;
    isCloud: boolean;
    cmUrl?: string;
    identityUrl?: string;
    allowWrite?: boolean;
    projectId?: string;
    environmentId?: string;
}
