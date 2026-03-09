import * as vscode from 'vscode';
import * as path from 'path';
import { ConfigService } from '../services/configService';
import { TerminalRunner } from '../utils/terminalRunner';
import { Logger } from '../utils/logger';

export class PackageCreateCommand {
    public async execute(): Promise<void> {
        try {
            Logger.info('Executing package create (itemres) command...');

            const options = await this.gatherPackageOptions();
            if (!options) {
                return;
            }

            const command = this.buildPackageCommand(options);
            TerminalRunner.runCommand(command);
            vscode.window.showInformationMessage('Package creation started');
        } catch (error) {
            Logger.error('Package create command failed', error as Error);
            vscode.window.showErrorMessage('Failed to create package');
        }
    }

    private async gatherPackageOptions(): Promise<PackageOptions | undefined> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('No workspace folder found');
            return undefined;
        }

        // Step 1: Output path
        const outputPath = await vscode.window.showInputBox({
            prompt: 'Enter output path for the package',
            value: 'itemres',
            placeHolder: 'e.g., itemres, packages/output',
            title: 'Package Create - Step 1: Output Path'
        });

        if (!outputPath) {
            return undefined;
        }

        // Step 2: Include options
        const includeOption = await vscode.window.showQuickPick([
            { label: 'All Modules', description: 'Include all serialized modules', value: 'all' },
            { label: 'Specific Modules', description: 'Select specific modules to include', value: 'modules' },
            { label: 'By Tags', description: 'Include modules by tags', value: 'tags' }
        ], {
            placeHolder: 'What to include in the package?',
            title: 'Package Create - Step 2: Include Options'
        });

        if (!includeOption) {
            return undefined;
        }

        let includeModules: string[] | undefined;
        let includeTags: string[] | undefined;

        if (includeOption.value === 'modules') {
            const modulesInput = await vscode.window.showInputBox({
                prompt: 'Enter module names (comma-separated)',
                placeHolder: 'e.g., Feature.Navigation, Foundation.Serialization'
            });
            if (modulesInput) {
                includeModules = modulesInput.split(',').map(m => m.trim());
            }
        } else if (includeOption.value === 'tags') {
            const tagsInput = await vscode.window.showInputBox({
                prompt: 'Enter tags (comma-separated)',
                placeHolder: 'e.g., content, templates'
            });
            if (tagsInput) {
                includeTags = tagsInput.split(',').map(t => t.trim());
            }
        }

        // Step 3: Overwrite option
        const overwriteOption = await vscode.window.showQuickPick([
            { label: 'No', description: 'Do not overwrite existing files', value: false },
            { label: 'Yes', description: 'Overwrite existing package files', value: true }
        ], {
            placeHolder: 'Overwrite existing package files?',
            title: 'Package Create - Step 3: Overwrite'
        });

        if (!overwriteOption) {
            return undefined;
        }

        return {
            outputPath,
            includeModules,
            includeTags,
            overwrite: overwriteOption.value
        };
    }

    private buildPackageCommand(options: PackageOptions): string {
        let command = `dotnet sitecore itemres create -o "${options.outputPath}"`;

        if (options.includeModules && options.includeModules.length > 0) {
            options.includeModules.forEach(m => {
                command += ` -i "${m}"`;
            });
        }

        if (options.includeTags && options.includeTags.length > 0) {
            options.includeTags.forEach(t => {
                command += ` --tags "${t}"`;
            });
        }

        if (options.overwrite) {
            command += ' --overwrite';
        }

        return command;
    }
}

interface PackageOptions {
    outputPath: string;
    includeModules?: string[];
    includeTags?: string[];
    overwrite?: boolean;
}

export class SerPackageCreateCommand {
    public async execute(): Promise<void> {
        try {
            Logger.info('Executing serialization package create command...');

            const options = await this.gatherOptions();
            if (!options) {
                return;
            }

            const command = this.buildCommand(options);
            TerminalRunner.runCommand(command);
            vscode.window.showInformationMessage('Serialization package creation started');
        } catch (error) {
            Logger.error('Serialization package create command failed', error as Error);
            vscode.window.showErrorMessage('Failed to create serialization package');
        }
    }

    private async gatherOptions(): Promise<SerPackageOptions | undefined> {
        // Output path
        const outputPath = await vscode.window.showInputBox({
            prompt: 'Enter output path for the package',
            value: 'ser-package.zip',
            placeHolder: 'e.g., ser-package.zip, packages/output.zip',
            title: 'Serialization Package - Output Path'
        });

        if (!outputPath) {
            return undefined;
        }

        // Include modules
        const includeModulesInput = await vscode.window.showInputBox({
            prompt: 'Enter module names to include (comma-separated, leave empty for all)',
            placeHolder: 'e.g., Feature.Navigation, Foundation.Serialization'
        });

        const includeModules = includeModulesInput 
            ? includeModulesInput.split(',').map(m => m.trim()) 
            : undefined;

        // Overwrite
        const overwriteOption = await vscode.window.showQuickPick([
            { label: 'No', value: false },
            { label: 'Yes', value: true }
        ], {
            placeHolder: 'Overwrite existing package?'
        });

        return {
            outputPath,
            includeModules,
            overwrite: overwriteOption?.value ?? false
        };
    }

    private buildCommand(options: SerPackageOptions): string {
        let command = `dotnet sitecore ser package create -o "${options.outputPath}"`;

        if (options.includeModules && options.includeModules.length > 0) {
            options.includeModules.forEach(m => {
                command += ` --include "${m}"`;
            });
        }

        if (options.overwrite) {
            command += ' --overwrite';
        }

        return command;
    }
}

interface SerPackageOptions {
    outputPath: string;
    includeModules?: string[];
    overwrite?: boolean;
}

export class SerPackageInstallCommand {
    public async execute(): Promise<void> {
        try {
            Logger.info('Executing serialization package install command...');

            const fileUri = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                filters: {
                    'Package Files': ['zip', 'itempackage']
                },
                title: 'Select Package to Install'
            });

            if (!fileUri || fileUri.length === 0) {
                return;
            }

            const packagePath = fileUri[0].fsPath;
            const environment = ConfigService.getEnvironment();

            const command = `dotnet sitecore ser package install -p "${packagePath}" --environment-name "${environment}"`;
            TerminalRunner.runCommand(command);
            vscode.window.showInformationMessage(`Installing package: ${path.basename(packagePath)}`);
        } catch (error) {
            Logger.error('Serialization package install command failed', error as Error);
            vscode.window.showErrorMessage('Failed to install package');
        }
    }
}
