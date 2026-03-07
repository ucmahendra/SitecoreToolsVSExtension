import * as vscode from 'vscode';
import { ModuleTreeItem } from '../ui/moduleTreeItem';
import { SitecoreCliService } from '../services/sitecoreCliService';
import { Logger } from '../utils/logger';

export class PushModuleCommand {
    private sitecoreCliService: SitecoreCliService;

    constructor() {
        this.sitecoreCliService = new SitecoreCliService();
    }

    public async execute(item?: ModuleTreeItem): Promise<void> {
        if (!item) {
            vscode.window.showWarningMessage('No module selected');
            return;
        }

        const moduleName = item.module.name;
        
        try {
            Logger.info(`Executing push for module: ${moduleName}`);
            this.sitecoreCliService.pushModule(moduleName);
            vscode.window.showInformationMessage(`Pushing module: ${moduleName}`);
        } catch (error) {
            Logger.error(`Failed to push module: ${moduleName}`, error as Error);
            vscode.window.showErrorMessage(`Failed to push module: ${moduleName}`);
        }
    }
}
