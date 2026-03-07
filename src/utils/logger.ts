import * as vscode from 'vscode';

export class Logger {
    private static outputChannel: vscode.OutputChannel;

    public static initialize(): void {
        if (!this.outputChannel) {
            this.outputChannel = vscode.window.createOutputChannel('Sitecore DevTools');
        }
    }

    public static info(message: string): void {
        this.log('INFO', message);
    }

    public static warn(message: string): void {
        this.log('WARN', message);
    }

    public static error(message: string, error?: Error): void {
        this.log('ERROR', message);
        if (error) {
            this.log('ERROR', error.message);
            if (error.stack) {
                this.log('ERROR', error.stack);
            }
        }
    }

    public static command(command: string): void {
        this.log('COMMAND', command);
    }

    public static modules(modules: string[]): void {
        this.log('MODULES', `Detected ${modules.length} module(s): ${modules.join(', ')}`);
    }

    public static smartSync(modules: string[]): void {
        this.log('SMART SYNC', `Modules to sync: ${modules.join(', ')}`);
    }

    public static show(): void {
        this.outputChannel?.show();
    }

    private static log(level: string, message: string): void {
        const timestamp = new Date().toISOString();
        this.outputChannel?.appendLine(`[${timestamp}] [${level}] ${message}`);
    }

    public static dispose(): void {
        this.outputChannel?.dispose();
    }
}
