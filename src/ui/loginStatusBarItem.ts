import * as vscode from 'vscode';
import { LoginService } from '../services/loginService';

export class LoginStatusBarItem {
    private statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            100
        );
        this.statusBarItem.command = 'sitecoreDevtools.login';
        this.updateStatus(LoginService.isLoggedIn);
        this.statusBarItem.show();

        LoginService.onLoginStatusChanged((isLoggedIn) => {
            this.updateStatus(isLoggedIn);
        });
    }

    private updateStatus(isLoggedIn: boolean): void {
        if (isLoggedIn) {
            this.statusBarItem.text = '$(check) Sitecore: Logged In';
            this.statusBarItem.backgroundColor = undefined;
            this.statusBarItem.tooltip = 'Click to manage Sitecore login';
            this.statusBarItem.command = 'sitecoreDevtools.logout';
        } else {
            this.statusBarItem.text = '$(warning) Sitecore: Not Logged In';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
            this.statusBarItem.tooltip = 'Click to login to Sitecore';
            this.statusBarItem.command = 'sitecoreDevtools.login';
        }
    }

    public dispose(): void {
        this.statusBarItem.dispose();
    }
}
