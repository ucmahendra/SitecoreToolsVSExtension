import * as vscode from 'vscode';
import { ModulesTreeProvider } from '../providers/modulesTreeProvider';
import { SitecoreCliService } from '../services/sitecoreCliService';
import { Logger } from '../utils/logger';

export class PullAllModulesCommand {
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

        const moduleNames = modules.map(m => m.name);
        
        try {
            Logger.info(`Executing pull for all modules: ${moduleNames.join(', ')}`);
            this.sitecoreCliService.pullAllModules(moduleNames);
            vscode.window.showInformationMessage(`Pulling ${moduleNames.length} module(s)`);
        } catch (error) {
            Logger.error('Failed to pull all modules', error as Error);
            vscode.window.showErrorMessage('Failed to pull all modules');
        }
    }
}
