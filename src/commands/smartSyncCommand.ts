import * as vscode from 'vscode';
import { ModulesTreeProvider } from '../providers/modulesTreeProvider';
import { SmartSyncService } from '../services/smartSyncService';
import { Logger } from '../utils/logger';

export class SmartSyncCommand {
    private smartSyncService: SmartSyncService;
    private modulesTreeProvider: ModulesTreeProvider;

    constructor(modulesTreeProvider: ModulesTreeProvider) {
        this.smartSyncService = new SmartSyncService();
        this.modulesTreeProvider = modulesTreeProvider;
    }

    public async execute(): Promise<void> {
        const modules = this.modulesTreeProvider.getModules();
        
        if (modules.length === 0) {
            vscode.window.showWarningMessage('No modules found in workspace');
            return;
        }

        try {
            Logger.info('Starting Smart Sync...');
            Logger.show();
            
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Smart Sync',
                cancellable: false
            }, async (progress) => {
                progress.report({ message: 'Detecting changed modules...' });
                
                const syncedModules = await this.smartSyncService.smartSync(modules);
                
                if (syncedModules.length === 0) {
                    vscode.window.showInformationMessage('Smart Sync: No modules need to be synced');
                } else {
                    vscode.window.showInformationMessage(
                        `Smart Sync: Pulling ${syncedModules.length} module(s): ${syncedModules.join(', ')}`
                    );
                }
            });
        } catch (error) {
            Logger.error('Smart Sync failed', error as Error);
            vscode.window.showErrorMessage('Smart Sync failed. Check output for details.');
        }
    }
}
