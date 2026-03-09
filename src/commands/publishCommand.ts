import * as vscode from 'vscode';
import { ConfigService } from '../services/configService';
import { TerminalRunner } from '../utils/terminalRunner';
import { Logger } from '../utils/logger';

export interface PublishOptions {
    publishMode?: 'full' | 'smart' | 'incremental';
    target?: string[];
    languages?: string[];
    publishRelatedItems?: boolean;
    publishSubitems?: boolean;
    path?: string;
}

export class PublishCommand {
    public async execute(): Promise<void> {
        try {
            Logger.info('Executing publish command...');

            const options = await this.gatherPublishOptions();
            if (!options) {
                return;
            }

            const command = this.buildPublishCommand(options);
            TerminalRunner.runCommand(command);
            vscode.window.showInformationMessage('Publish command started');
        } catch (error) {
            Logger.error('Publish command failed', error as Error);
            vscode.window.showErrorMessage('Failed to execute publish command');
        }
    }

    private async gatherPublishOptions(): Promise<PublishOptions | undefined> {
        // Step 1: Select publish mode
        const publishModeOptions = [
            { label: 'Smart Publish', description: 'Publish only changed items (recommended)', value: 'smart' as const },
            { label: 'Full Publish', description: 'Republish all items', value: 'full' as const },
            { label: 'Incremental Publish', description: 'Publish items in publish queue', value: 'incremental' as const }
        ];

        const selectedMode = await vscode.window.showQuickPick(publishModeOptions, {
            placeHolder: 'Select publish mode',
            title: 'Publish - Step 1: Mode'
        });

        if (!selectedMode) {
            return undefined;
        }

        // Step 2: Select target databases
        const targetOptions = [
            { label: 'web', description: 'Web database', picked: true },
            { label: 'preview', description: 'Preview database' }
        ];

        const selectedTargets = await vscode.window.showQuickPick(targetOptions, {
            placeHolder: 'Select target database(s)',
            title: 'Publish - Step 2: Targets',
            canPickMany: true
        });

        if (!selectedTargets || selectedTargets.length === 0) {
            return undefined;
        }

        // Step 3: Select languages (optional)
        const languageInput = await vscode.window.showInputBox({
            prompt: 'Enter languages to publish (comma-separated, leave empty for all)',
            placeHolder: 'e.g., en, de-DE, fr-FR',
            title: 'Publish - Step 3: Languages'
        });

        if (languageInput === undefined) {
            return undefined;
        }

        // Step 4: Additional options
        const additionalOptions = await vscode.window.showQuickPick([
            { label: 'Publish Related Items', description: 'Include related items in publish', value: 'related', picked: false },
            { label: 'Publish Subitems', description: 'Include subitems in publish', value: 'subitems', picked: false }
        ], {
            placeHolder: 'Select additional options (optional)',
            title: 'Publish - Step 4: Additional Options',
            canPickMany: true
        });

        // Step 5: Specific path (optional)
        const pathInput = await vscode.window.showInputBox({
            prompt: 'Enter specific path to publish (optional)',
            placeHolder: 'e.g., /sitecore/content/Home',
            title: 'Publish - Step 5: Path'
        });

        if (pathInput === undefined) {
            return undefined;
        }

        return {
            publishMode: selectedMode.value,
            target: selectedTargets.map(t => t.label),
            languages: languageInput ? languageInput.split(',').map(l => l.trim()) : undefined,
            publishRelatedItems: additionalOptions?.some(o => o.value === 'related'),
            publishSubitems: additionalOptions?.some(o => o.value === 'subitems'),
            path: pathInput || undefined
        };
    }

    private buildPublishCommand(options: PublishOptions): string {
        const environment = ConfigService.getEnvironment();
        let command = `dotnet sitecore publish --environment-name "${environment}"`;

        if (options.publishMode === 'full') {
            command += ' --republish';
        }

        if (options.target && options.target.length > 0) {
            options.target.forEach(t => {
                command += ` --target "${t}"`;
            });
        }

        if (options.languages && options.languages.length > 0) {
            options.languages.forEach(l => {
                command += ` --language "${l}"`;
            });
        }

        if (options.publishRelatedItems) {
            command += ' --publish-related-items';
        }

        if (options.publishSubitems) {
            command += ' --publish-subitems';
        }

        if (options.path) {
            command += ` --path "${options.path}"`;
        }

        return command;
    }
}

export class PublishSiteCommand {
    public async execute(): Promise<void> {
        try {
            Logger.info('Executing publish site command...');
            const environment = ConfigService.getEnvironment();
            
            const siteName = await vscode.window.showInputBox({
                prompt: 'Enter site name to publish',
                placeHolder: 'e.g., website'
            });

            if (!siteName) {
                return;
            }

            const command = `dotnet sitecore publish --environment-name "${environment}" --site "${siteName}"`;
            TerminalRunner.runCommand(command);
            vscode.window.showInformationMessage(`Publishing site: ${siteName}`);
        } catch (error) {
            Logger.error('Publish site command failed', error as Error);
            vscode.window.showErrorMessage('Failed to publish site');
        }
    }
}
