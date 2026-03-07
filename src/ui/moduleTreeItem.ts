import * as vscode from 'vscode';
import { Module } from '../models/module';

export class ModuleTreeItem extends vscode.TreeItem {
    constructor(
        public readonly module: Module
    ) {
        super(module.name, vscode.TreeItemCollapsibleState.None);
        
        this.tooltip = this.createTooltip();
        this.description = this.getModuleType();
        this.iconPath = new vscode.ThemeIcon('package');
        this.contextValue = 'module';
        
        this.command = {
            command: 'vscode.open',
            title: 'Open Module',
            arguments: [vscode.Uri.file(module.path)]
        };
    }

    private createTooltip(): vscode.MarkdownString {
        const tooltip = new vscode.MarkdownString();
        tooltip.appendMarkdown(`**${this.module.name}**\n\n`);
        tooltip.appendMarkdown(`**Path:** ${this.module.folder}\n\n`);
        
        if (this.module.includePaths.length > 0) {
            tooltip.appendMarkdown(`**Includes:**\n`);
            for (const path of this.module.includePaths) {
                tooltip.appendMarkdown(`- ${path}\n`);
            }
        }
        
        return tooltip;
    }

    private getModuleType(): string {
        const name = this.module.name.toLowerCase();
        if (name.startsWith('feature.')) {
            return 'Feature';
        } else if (name.startsWith('foundation.')) {
            return 'Foundation';
        } else if (name.startsWith('project.')) {
            return 'Project';
        }
        return '';
    }
}
