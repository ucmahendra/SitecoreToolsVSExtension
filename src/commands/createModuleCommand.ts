import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigService, ModuleIncludeConfig } from '../services/configService';
import { Logger } from '../utils/logger';

interface ModuleCreationOptions {
    namespace: string;
    name: string;
    folder: string;
    serializationPath: string;
    includes: ModuleIncludeConfig[];
}

export class CreateModuleCommand {
    public async execute(): Promise<void> {
        try {
            const options = await this.gatherModuleOptions();
            if (!options) {
                return;
            }

            await this.createModule(options);
            vscode.window.showInformationMessage(`Module "${options.namespace}.${options.name}" created successfully`);
            vscode.commands.executeCommand('sitecoreDevtools.refreshModules');
        } catch (error) {
            Logger.error('Failed to create module', error as Error);
            vscode.window.showErrorMessage('Failed to create module');
        }
    }

    private async gatherModuleOptions(): Promise<ModuleCreationOptions | undefined> {
        const defaultConfig = ConfigService.getDefaultModuleConfig();

        // Step 1: Select module layer/namespace
        const namespaceOptions = [
            { label: 'Feature', description: 'Feature layer modules', value: 'Feature' },
            { label: 'Foundation', description: 'Foundation layer modules', value: 'Foundation' },
            { label: 'Project', description: 'Project layer modules', value: 'Project' },
            { label: 'Custom', description: 'Enter custom namespace', value: 'custom' }
        ];

        const selectedNamespace = await vscode.window.showQuickPick(namespaceOptions, {
            placeHolder: 'Select module layer/namespace',
            title: 'Create Module - Step 1: Namespace'
        });

        if (!selectedNamespace) {
            return undefined;
        }

        let namespace = selectedNamespace.value;
        if (namespace === 'custom') {
            const customNamespace = await vscode.window.showInputBox({
                prompt: 'Enter custom namespace',
                value: defaultConfig.namespace,
                placeHolder: 'e.g., MyCompany'
            });
            if (!customNamespace) {
                return undefined;
            }
            namespace = customNamespace;
        }

        // Step 2: Enter module name
        const moduleName = await vscode.window.showInputBox({
            prompt: 'Enter module name',
            value: defaultConfig.name,
            placeHolder: 'e.g., Header, Navigation, Rendering',
            validateInput: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'Module name is required';
                }
                if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(value)) {
                    return 'Module name must start with a letter and contain only alphanumeric characters';
                }
                return undefined;
            }
        });

        if (!moduleName) {
            return undefined;
        }

        // Step 3: Select folder location
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('No workspace folder found');
            return undefined;
        }

        const folderUri = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            defaultUri: workspaceFolders[0].uri,
            openLabel: 'Select Module Location',
            title: 'Create Module - Step 3: Location'
        });

        if (!folderUri || folderUri.length === 0) {
            return undefined;
        }

        const baseFolder = folderUri[0].fsPath;
        const moduleFolder = path.join(baseFolder, `${namespace}.${moduleName}`);

        // Step 4: Serialization path
        const serializationPath = await vscode.window.showInputBox({
            prompt: 'Enter serialization path (relative to module folder)',
            value: defaultConfig.serializationPath || 'items',
            placeHolder: 'e.g., items, serialization'
        });

        if (serializationPath === undefined) {
            return undefined;
        }

        // Step 5: Add includes
        const includes: ModuleIncludeConfig[] = [];
        let addMoreIncludes = true;

        while (addMoreIncludes) {
            const addInclude = await vscode.window.showQuickPick([
                { label: '$(add) Add Include Path', value: 'add' },
                { label: '$(check) Done Adding Includes', value: 'done' }
            ], {
                placeHolder: includes.length === 0 ? 'Add at least one include path' : `${includes.length} include(s) added. Add more?`,
                title: 'Create Module - Step 5: Include Paths'
            });

            if (!addInclude || addInclude.value === 'done') {
                addMoreIncludes = false;
                continue;
            }

            const includeConfig = await this.gatherIncludeOptions(namespace, moduleName);
            if (includeConfig) {
                includes.push(includeConfig);
            }
        }

        return {
            namespace,
            name: moduleName,
            folder: moduleFolder,
            serializationPath: serializationPath || 'items',
            includes
        };
    }

    private async gatherIncludeOptions(namespace: string, moduleName: string): Promise<ModuleIncludeConfig | undefined> {
        // Include name
        const includeName = await vscode.window.showInputBox({
            prompt: 'Enter include name',
            value: `${namespace}.${moduleName}`,
            placeHolder: 'e.g., Feature.Header.Templates'
        });

        if (!includeName) {
            return undefined;
        }

        // Include path
        const pathOptions = [
            { label: '/sitecore/templates', description: 'Templates folder', value: '/sitecore/templates' },
            { label: '/sitecore/layout/Renderings', description: 'Renderings folder', value: '/sitecore/layout/Renderings' },
            { label: '/sitecore/layout/Placeholder Settings', description: 'Placeholder Settings', value: '/sitecore/layout/Placeholder Settings' },
            { label: '/sitecore/content', description: 'Content folder', value: '/sitecore/content' },
            { label: '/sitecore/media library', description: 'Media Library', value: '/sitecore/media library' },
            { label: '/sitecore/system/Settings', description: 'System Settings', value: '/sitecore/system/Settings' },
            { label: 'Custom Path', description: 'Enter custom Sitecore path', value: 'custom' }
        ];

        const selectedPath = await vscode.window.showQuickPick(pathOptions, {
            placeHolder: 'Select or enter Sitecore path',
            title: 'Include Path'
        });

        if (!selectedPath) {
            return undefined;
        }

        let includePath = selectedPath.value;
        if (includePath === 'custom') {
            const customPath = await vscode.window.showInputBox({
                prompt: 'Enter Sitecore path',
                placeHolder: '/sitecore/...',
                validateInput: (value) => {
                    if (!value || !value.startsWith('/sitecore')) {
                        return 'Path must start with /sitecore';
                    }
                    return undefined;
                }
            });
            if (!customPath) {
                return undefined;
            }
            includePath = customPath;
        }

        // Scope
        const scopeOptions = [
            { label: 'ItemAndDescendants', description: 'Include item and all descendants (default)', value: 'ItemAndDescendants' as const },
            { label: 'ItemAndChildren', description: 'Include item and direct children only', value: 'ItemAndChildren' as const },
            { label: 'SingleItem', description: 'Include only the specified item', value: 'SingleItem' as const },
            { label: 'DescendantsOnly', description: 'Include descendants only, not the item itself', value: 'DescendantsOnly' as const }
        ];

        const selectedScope = await vscode.window.showQuickPick(scopeOptions, {
            placeHolder: 'Select serialization scope',
            title: 'Include Scope'
        });

        // Allowed push operations
        const pushOperationOptions = [
            { label: 'CreateAndUpdate', description: 'Allow create and update operations', value: 'CreateAndUpdate' as const, picked: true },
            { label: 'CreateOnly', description: 'Allow create operations only', value: 'CreateOnly' as const },
            { label: 'UpdateOnly', description: 'Allow update operations only', value: 'UpdateOnly' as const }
        ];

        const selectedPushOps = await vscode.window.showQuickPick(pushOperationOptions, {
            placeHolder: 'Select allowed push operations',
            title: 'Allowed Push Operations',
            canPickMany: true
        });

        // Database
        const databaseOptions = [
            { label: 'master', description: 'Master database (default)', value: 'master' },
            { label: 'core', description: 'Core database', value: 'core' },
            { label: 'web', description: 'Web database', value: 'web' }
        ];

        const selectedDatabase = await vscode.window.showQuickPick(databaseOptions, {
            placeHolder: 'Select database',
            title: 'Database'
        });

        return {
            name: includeName,
            path: includePath,
            scope: selectedScope?.value,
            allowedPushOperations: selectedPushOps?.map(op => op.value),
            database: selectedDatabase?.value
        };
    }

    private async createModule(options: ModuleCreationOptions): Promise<void> {
        // Create module folder
        if (!fs.existsSync(options.folder)) {
            fs.mkdirSync(options.folder, { recursive: true });
        }

        // Create serialization folder
        const serializationFolder = path.join(options.folder, options.serializationPath);
        if (!fs.existsSync(serializationFolder)) {
            fs.mkdirSync(serializationFolder, { recursive: true });
        }

        // Create module.json
        const moduleJson = {
            namespace: options.namespace,
            name: options.name,
            items: {
                includes: options.includes.map(include => {
                    const includeObj: Record<string, unknown> = {
                        name: include.name,
                        path: include.path
                    };
                    if (include.scope) {
                        includeObj.scope = include.scope;
                    }
                    if (include.allowedPushOperations && include.allowedPushOperations.length > 0) {
                        includeObj.allowedPushOperations = include.allowedPushOperations;
                    }
                    if (include.database && include.database !== 'master') {
                        includeObj.database = include.database;
                    }
                    return includeObj;
                })
            }
        };

        const moduleJsonPath = path.join(options.folder, 'module.json');
        fs.writeFileSync(moduleJsonPath, JSON.stringify(moduleJson, null, 2));

        Logger.info(`Created module at: ${moduleJsonPath}`);

        // Open the created module.json
        const document = await vscode.workspace.openTextDocument(moduleJsonPath);
        await vscode.window.showTextDocument(document);
    }
}
