import * as vscode from 'vscode';
import { ConfigService } from '../services/configService';
import { TerminalRunner } from '../utils/terminalRunner';
import { Logger } from '../utils/logger';

const COMMON_INDEXES = [
    { label: 'sitecore_master_index', description: 'Master database index' },
    { label: 'sitecore_web_index', description: 'Web database index' },
    { label: 'sitecore_core_index', description: 'Core database index' },
    { label: 'sitecore_marketing_asset_index_master', description: 'Marketing assets master index' },
    { label: 'sitecore_marketing_asset_index_web', description: 'Marketing assets web index' },
    { label: 'sitecore_marketingdefinitions_master', description: 'Marketing definitions master index' },
    { label: 'sitecore_marketingdefinitions_web', description: 'Marketing definitions web index' },
    { label: 'sitecore_suggested_test_index', description: 'Suggested test index' },
    { label: 'sitecore_fxm_master_index', description: 'FXM master index' },
    { label: 'sitecore_fxm_web_index', description: 'FXM web index' }
];

export class IndexRebuildCommand {
    public async execute(): Promise<void> {
        try {
            Logger.info('Executing index rebuild command...');

            const indexChoice = await vscode.window.showQuickPick([
                { label: '$(list-unordered) All Indexes', description: 'Rebuild all indexes', value: 'all' },
                ...COMMON_INDEXES.map(i => ({ ...i, value: i.label })),
                { label: '$(edit) Custom Index', description: 'Enter a custom index name', value: 'custom' }
            ], {
                placeHolder: 'Select index to rebuild',
                title: 'Rebuild Index'
            });

            if (!indexChoice) {
                return;
            }

            const environment = ConfigService.getEnvironment();
            let command: string;

            if (indexChoice.value === 'all') {
                command = `dotnet sitecore index rebuild --environment-name "${environment}"`;
            } else if (indexChoice.value === 'custom') {
                const customIndex = await vscode.window.showInputBox({
                    prompt: 'Enter index name',
                    placeHolder: 'e.g., sitecore_master_index'
                });
                if (!customIndex) {
                    return;
                }
                command = `dotnet sitecore index rebuild --name "${customIndex}" --environment-name "${environment}"`;
            } else {
                command = `dotnet sitecore index rebuild --name "${indexChoice.value}" --environment-name "${environment}"`;
            }

            const confirm = await vscode.window.showWarningMessage(
                'Rebuilding indexes can take a long time. Continue?',
                'Yes', 'No'
            );

            if (confirm !== 'Yes') {
                return;
            }

            TerminalRunner.runCommand(command);
            vscode.window.showInformationMessage('Index rebuild started');
        } catch (error) {
            Logger.error('Index rebuild command failed', error as Error);
            vscode.window.showErrorMessage('Failed to rebuild index');
        }
    }
}

export class IndexPopulateCommand {
    public async execute(): Promise<void> {
        try {
            Logger.info('Executing index populate command...');

            const indexChoice = await vscode.window.showQuickPick([
                { label: '$(list-unordered) All Indexes', description: 'Populate all indexes', value: 'all' },
                ...COMMON_INDEXES.map(i => ({ ...i, value: i.label })),
                { label: '$(edit) Custom Index', description: 'Enter a custom index name', value: 'custom' }
            ], {
                placeHolder: 'Select index to populate',
                title: 'Populate Index'
            });

            if (!indexChoice) {
                return;
            }

            const environment = ConfigService.getEnvironment();
            let command: string;

            if (indexChoice.value === 'all') {
                command = `dotnet sitecore index populate --environment-name "${environment}"`;
            } else if (indexChoice.value === 'custom') {
                const customIndex = await vscode.window.showInputBox({
                    prompt: 'Enter index name',
                    placeHolder: 'e.g., sitecore_master_index'
                });
                if (!customIndex) {
                    return;
                }
                command = `dotnet sitecore index populate --name "${customIndex}" --environment-name "${environment}"`;
            } else {
                command = `dotnet sitecore index populate --name "${indexChoice.value}" --environment-name "${environment}"`;
            }

            TerminalRunner.runCommand(command);
            vscode.window.showInformationMessage('Index populate started');
        } catch (error) {
            Logger.error('Index populate command failed', error as Error);
            vscode.window.showErrorMessage('Failed to populate index');
        }
    }
}

export class IndexSchemaPopulateCommand {
    public async execute(): Promise<void> {
        try {
            Logger.info('Executing index schema populate command...');

            const indexChoice = await vscode.window.showQuickPick([
                { label: '$(list-unordered) All Indexes', description: 'Populate schema for all indexes', value: 'all' },
                ...COMMON_INDEXES.map(i => ({ ...i, value: i.label })),
                { label: '$(edit) Custom Index', description: 'Enter a custom index name', value: 'custom' }
            ], {
                placeHolder: 'Select index for schema population',
                title: 'Populate Index Schema'
            });

            if (!indexChoice) {
                return;
            }

            const environment = ConfigService.getEnvironment();
            let command: string;

            if (indexChoice.value === 'all') {
                command = `dotnet sitecore index schema-populate --environment-name "${environment}"`;
            } else if (indexChoice.value === 'custom') {
                const customIndex = await vscode.window.showInputBox({
                    prompt: 'Enter index name',
                    placeHolder: 'e.g., sitecore_master_index'
                });
                if (!customIndex) {
                    return;
                }
                command = `dotnet sitecore index schema-populate --name "${customIndex}" --environment-name "${environment}"`;
            } else {
                command = `dotnet sitecore index schema-populate --name "${indexChoice.value}" --environment-name "${environment}"`;
            }

            TerminalRunner.runCommand(command);
            vscode.window.showInformationMessage('Index schema populate started');
        } catch (error) {
            Logger.error('Index schema populate command failed', error as Error);
            vscode.window.showErrorMessage('Failed to populate index schema');
        }
    }
}
