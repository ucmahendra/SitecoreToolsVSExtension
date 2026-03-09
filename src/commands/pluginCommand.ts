import * as vscode from 'vscode';
import { TerminalRunner } from '../utils/terminalRunner';
import { Logger } from '../utils/logger';

const COMMON_PLUGINS = [
    { label: 'Sitecore.DevEx.Extensibility.Serialization', description: 'Serialization plugin for ser commands' },
    { label: 'Sitecore.DevEx.Extensibility.Publishing', description: 'Publishing plugin for publish commands' },
    { label: 'Sitecore.DevEx.Extensibility.Indexing', description: 'Indexing plugin for index commands' },
    { label: 'Sitecore.DevEx.Extensibility.ResourcePackage', description: 'Resource package plugin for itemres commands' }
];

export class PluginAddCommand {
    public async execute(): Promise<void> {
        try {
            Logger.info('Executing plugin add command...');

            const pluginChoice = await vscode.window.showQuickPick([
                ...COMMON_PLUGINS.map(p => ({ ...p, value: p.label })),
                { label: '$(edit) Custom Plugin', description: 'Enter a custom plugin name', value: 'custom' }
            ], {
                placeHolder: 'Select plugin to add',
                title: 'Add Sitecore Plugin'
            });

            if (!pluginChoice) {
                return;
            }

            let pluginName = pluginChoice.value;
            if (pluginName === 'custom') {
                const customPlugin = await vscode.window.showInputBox({
                    prompt: 'Enter plugin name',
                    placeHolder: 'e.g., Sitecore.DevEx.Extensibility.MyPlugin'
                });
                if (!customPlugin) {
                    return;
                }
                pluginName = customPlugin;
            }

            const versionInput = await vscode.window.showInputBox({
                prompt: 'Enter plugin version (optional)',
                placeHolder: 'Leave empty for latest version'
            });

            let command = `dotnet sitecore plugin add -n ${pluginName}`;
            if (versionInput) {
                command += ` -v ${versionInput}`;
            }

            TerminalRunner.runCommand(command);
            vscode.window.showInformationMessage(`Adding plugin: ${pluginName}`);
        } catch (error) {
            Logger.error('Plugin add command failed', error as Error);
            vscode.window.showErrorMessage('Failed to add plugin');
        }
    }
}

export class PluginRemoveCommand {
    public async execute(): Promise<void> {
        try {
            Logger.info('Executing plugin remove command...');

            const pluginChoice = await vscode.window.showQuickPick([
                ...COMMON_PLUGINS.map(p => ({ ...p, value: p.label })),
                { label: '$(edit) Custom Plugin', description: 'Enter a custom plugin name', value: 'custom' }
            ], {
                placeHolder: 'Select plugin to remove',
                title: 'Remove Sitecore Plugin'
            });

            if (!pluginChoice) {
                return;
            }

            let pluginName = pluginChoice.value;
            if (pluginName === 'custom') {
                const customPlugin = await vscode.window.showInputBox({
                    prompt: 'Enter plugin name to remove',
                    placeHolder: 'e.g., Sitecore.DevEx.Extensibility.MyPlugin'
                });
                if (!customPlugin) {
                    return;
                }
                pluginName = customPlugin;
            }

            const confirm = await vscode.window.showWarningMessage(
                `Are you sure you want to remove plugin: ${pluginName}?`,
                'Yes', 'No'
            );

            if (confirm !== 'Yes') {
                return;
            }

            const command = `dotnet sitecore plugin remove -n ${pluginName}`;
            TerminalRunner.runCommand(command);
            vscode.window.showInformationMessage(`Removing plugin: ${pluginName}`);
        } catch (error) {
            Logger.error('Plugin remove command failed', error as Error);
            vscode.window.showErrorMessage('Failed to remove plugin');
        }
    }
}

export class PluginListCommand {
    public async execute(): Promise<void> {
        try {
            Logger.info('Executing plugin list command...');
            const command = 'dotnet sitecore plugin list';
            TerminalRunner.runCommand(command);
        } catch (error) {
            Logger.error('Plugin list command failed', error as Error);
            vscode.window.showErrorMessage('Failed to list plugins');
        }
    }
}
