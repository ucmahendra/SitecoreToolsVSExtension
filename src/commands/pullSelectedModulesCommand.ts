import * as vscode from 'vscode';
import { ModulesTreeProvider } from '../providers/modulesTreeProvider';
import { SitecoreCliService } from '../services/sitecoreCliService';
import { Logger } from '../utils/logger';

interface ModuleQuickPickItem extends vscode.QuickPickItem {
    moduleName: string;
}

export class PullSelectedModulesCommand {
    private sitecoreCliService: SitecoreCliService;
    private modulesTreeProvider: ModulesTreeProvider;

    constructor(modulesTreeProvider: ModulesTreeProvider) {
        this.sitecoreCliService = new SitecoreCliService();
        this.modulesTreeProvider = modulesTreeProvider;
    }

    public async execute(): Promise<void> {
        const modules = this.modulesTreeProvider.getModules();
        
        if (modules.length === 0) {
            vscode.window.showWarningMessage('No modules found in workspace');
            return;
        }

        const quickPickItems: ModuleQuickPickItem[] = modules.map(m => ({
            label: m.name,
            description: m.folder,
            detail: m.includePaths.length > 0 ? `Includes: ${m.includePaths.join(', ')}` : undefined,
            moduleName: m.name
        }));

        const selectedItems = await vscode.window.showQuickPick(quickPickItems, {
            canPickMany: true,
            placeHolder: 'Select modules to pull',
            title: 'Pull Selected Modules'
        });

        if (!selectedItems || selectedItems.length === 0) {
            return;
        }

        const moduleNames = selectedItems.map(item => item.moduleName);
        
        try {
            Logger.info(`Executing pull for selected modules: ${moduleNames.join(', ')}`);
            this.sitecoreCliService.pullModules(moduleNames);
            vscode.window.showInformationMessage(`Pulling ${moduleNames.length} module(s): ${moduleNames.join(', ')}`);
        } catch (error) {
            Logger.error('Failed to pull selected modules', error as Error);
            vscode.window.showErrorMessage('Failed to pull selected modules');
        }
    }
}
