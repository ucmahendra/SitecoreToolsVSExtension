import { Module } from '../models/module';
import { SitecoreCliService } from './sitecoreCliService';
import { Logger } from '../utils/logger';

export class SmartSyncService {
    private sitecoreCliService: SitecoreCliService;

    constructor() {
        this.sitecoreCliService = new SitecoreCliService();
    }

    public async smartSync(modules: Module[]): Promise<string[]> {
        try {
            Logger.info('Starting Smart Sync - detecting changed modules...');
            
            const statusOutput = await this.sitecoreCliService.getSerializationStatus();
            const changedPaths = this.parseStatusOutput(statusOutput);
            
            Logger.info(`Found ${changedPaths.length} changed item path(s)`);
            
            const modulesToSync = this.mapPathsToModules(changedPaths, modules);
            
            if (modulesToSync.length === 0) {
                Logger.info('No modules need to be synced');
                return [];
            }

            Logger.smartSync(modulesToSync);
            this.sitecoreCliService.pullModules(modulesToSync);
            
            return modulesToSync;
        } catch (error) {
            Logger.error('Smart Sync failed', error as Error);
            throw error;
        }
    }

    private parseStatusOutput(output: string): string[] {
        const paths: string[] = [];
        const lines = output.split('\n');
        
        for (const line of lines) {
            const pathMatch = line.match(/\/sitecore\/[^\s]+/);
            if (pathMatch) {
                paths.push(pathMatch[0]);
            }
        }
        
        return [...new Set(paths)];
    }

    private mapPathsToModules(changedPaths: string[], modules: Module[]): string[] {
        const moduleSet = new Set<string>();
        
        for (const changedPath of changedPaths) {
            for (const module of modules) {
                for (const includePath of module.includePaths) {
                    if (this.isPathUnderInclude(changedPath, includePath)) {
                        moduleSet.add(module.name);
                        break;
                    }
                }
            }
        }
        
        return Array.from(moduleSet);
    }

    private isPathUnderInclude(changedPath: string, includePath: string): boolean {
        const normalizedChanged = changedPath.toLowerCase();
        const normalizedInclude = includePath.toLowerCase();
        
        return normalizedChanged.startsWith(normalizedInclude) || 
               normalizedInclude.startsWith(normalizedChanged);
    }
}
