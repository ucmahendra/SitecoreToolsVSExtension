import * as vscode from 'vscode';
import { LoginService } from '../services/loginService';
import { Logger } from '../utils/logger';

export class LoginCommand {
    public async execute(): Promise<void> {
        try {
            Logger.info('Executing login command...');
            await LoginService.loginWithPrompt();
        } catch (error) {
            Logger.error('Login failed', error as Error);
            vscode.window.showErrorMessage('Sitecore login failed');
        }
    }
}

export class LogoutCommand {
    public async execute(): Promise<void> {
        try {
            Logger.info('Executing logout command...');
            await LoginService.logout();
            vscode.window.showInformationMessage('Successfully logged out from Sitecore');
        } catch (error) {
            Logger.error('Logout failed', error as Error);
            vscode.window.showErrorMessage('Sitecore logout failed');
        }
    }
}

export class CheckLoginStatusCommand {
    public async execute(): Promise<void> {
        try {
            Logger.info('Checking login status...');
            const isLoggedIn = await LoginService.checkLoginStatus();
            if (isLoggedIn) {
                vscode.window.showInformationMessage('You are logged in to Sitecore');
            } else {
                vscode.window.showWarningMessage('You are not logged in to Sitecore. Click to login.', 'Login')
                    .then(selection => {
                        if (selection === 'Login') {
                            vscode.commands.executeCommand('sitecoreDevtools.login');
                        }
                    });
            }
        } catch (error) {
            Logger.error('Failed to check login status', error as Error);
        }
    }
}
