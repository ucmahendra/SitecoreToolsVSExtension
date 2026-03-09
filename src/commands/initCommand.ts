import * as vscode from 'vscode';
import { TerminalRunner } from '../utils/terminalRunner';
import { Logger } from '../utils/logger';

export class InitCommand {
    public async execute(): Promise<void> {
        try {
            Logger.info('Executing Sitecore init command...');

            const initOptions = await this.gatherInitOptions();
            if (!initOptions) {
                return;
            }

            let command = 'dotnet sitecore init';

            if (initOptions.name) {
                command += ` --name "${initOptions.name}"`;
            }

            if (initOptions.force) {
                command += ' --force';
            }

            TerminalRunner.runCommand(command);
            vscode.window.showInformationMessage('Sitecore project initialization started');
        } catch (error) {
            Logger.error('Init command failed', error as Error);
            vscode.window.showErrorMessage('Failed to initialize Sitecore project');
        }
    }

    private async gatherInitOptions(): Promise<{ name?: string; force?: boolean } | undefined> {
        const name = await vscode.window.showInputBox({
            prompt: 'Enter project name (optional)',
            placeHolder: 'Leave empty for default',
            title: 'Sitecore Init - Project Name'
        });

        if (name === undefined) {
            return undefined;
        }

        const forceOption = await vscode.window.showQuickPick([
            { label: 'No', description: 'Do not overwrite existing configuration', value: false },
            { label: 'Yes', description: 'Overwrite existing configuration files', value: true }
        ], {
            placeHolder: 'Force overwrite existing configuration?',
            title: 'Sitecore Init - Force Option'
        });

        if (!forceOption) {
            return undefined;
        }

        return {
            name: name || undefined,
            force: forceOption.value
        };
    }
}
