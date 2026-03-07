import * as vscode from 'vscode';
import { ModulesTreeProvider } from '../providers/modulesTreeProvider';
import { SitecoreCliService } from '../services/sitecoreCliService';
import { Logger } from '../utils/logger';

export class PullCheckedModulesCommand {
    private sitecoreCliService: SitecoreCliService;
    private modulesTreeProvider: ModulesTreeProvider;

    constructor(modulesTreeProvider: ModulesTreeProvider) {
        this.sitecoreCliService = new SitecoreCliService();
        this.modulesTreeProvider = modulesTreeProvider;
    }

    public async execute(): Promise<void> {
        const checkedModules = this.modulesTreeProvider.getCheckedModules();
        
        if (checkedModules.length === 0) {
            vscode.window.showWarningMessage('No modules selected. Use checkboxes to select modules first.');
            return;
        }

        const moduleNames = checkedModules.map(m => m.name);
        
        try {
            Logger.info(`Pulling checked modules: ${moduleNames.join(', ')}`);
            this.sitecoreCliService.pullModules(moduleNames);
            vscode.window.showInformationMessage(`Pulling ${moduleNames.length} checked module(s): ${moduleNames.join(', ')}`);
        } catch (error) {
            Logger.error('Failed to pull checked modules', error as Error);
            vscode.window.showErrorMessage('Failed to pull checked modules');
        }
    }
}

export class PushCheckedModulesCommand {
    private sitecoreCliService: SitecoreCliService;
    private modulesTreeProvider: ModulesTreeProvider;

    constructor(modulesTreeProvider: ModulesTreeProvider) {
        this.sitecoreCliService = new SitecoreCliService();
        this.modulesTreeProvider = modulesTreeProvider;
    }

    public async execute(): Promise<void> {
        const checkedModules = this.modulesTreeProvider.getCheckedModules();
        
        if (checkedModules.length === 0) {
            vscode.window.showWarningMessage('No modules selected. Use checkboxes to select modules first.');
            return;
        }

        const moduleNames = checkedModules.map(m => m.name);
        
        const confirm = await vscode.window.showWarningMessage(
            `Are you sure you want to push ${moduleNames.length} module(s)?`,
            { modal: true },
            'Yes, Push'
        );

        if (confirm !== 'Yes, Push') {
            return;
        }
        
        try {
            Logger.info(`Pushing checked modules: ${moduleNames.join(', ')}`);
            this.sitecoreCliService.pushModules(moduleNames);
            vscode.window.showInformationMessage(`Pushing ${moduleNames.length} checked module(s): ${moduleNames.join(', ')}`);
        } catch (error) {
            Logger.error('Failed to push checked modules', error as Error);
            vscode.window.showErrorMessage('Failed to push checked modules');
        }
    }
}

export class SelectAllModulesCommand {
    private modulesTreeProvider: ModulesTreeProvider;

    constructor(modulesTreeProvider: ModulesTreeProvider) {
        this.modulesTreeProvider = modulesTreeProvider;
    }

    public execute(): void {
        this.modulesTreeProvider.selectAllModules();
        vscode.window.showInformationMessage('All modules selected');
    }
}

export class DeselectAllModulesCommand {
    private modulesTreeProvider: ModulesTreeProvider;

    constructor(modulesTreeProvider: ModulesTreeProvider) {
        this.modulesTreeProvider = modulesTreeProvider;
    }

    public execute(): void {
        this.modulesTreeProvider.deselectAllModules();
        vscode.window.showInformationMessage('All modules deselected');
    }
}
