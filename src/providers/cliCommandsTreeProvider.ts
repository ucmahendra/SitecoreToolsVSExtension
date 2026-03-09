import * as vscode from 'vscode';

interface CliCommandItem {
    label: string;
    command?: string;
    icon: string;
    children?: CliCommandItem[];
}

const CLI_COMMANDS: CliCommandItem[] = [
    {
        label: 'Project Setup',
        icon: 'folder-opened',
        children: [
            { label: 'Initialize Project', command: 'sitecoreDevtools.init', icon: 'new-folder' },
            { label: 'Connect to Environment', command: 'sitecoreDevtools.connect', icon: 'plug' }
        ]
    },
    {
        label: 'Authentication',
        icon: 'key',
        children: [
            { label: 'Login', command: 'sitecoreDevtools.login', icon: 'sign-in' },
            { label: 'Logout', command: 'sitecoreDevtools.logout', icon: 'sign-out' },
            { label: 'Check Login Status', command: 'sitecoreDevtools.checkLoginStatus', icon: 'account' }
        ]
    },
    {
        label: 'Serialization',
        icon: 'database',
        children: [
            { label: 'Pull All Modules', command: 'sitecoreDevtools.pullAllModules', icon: 'cloud-download' },
            { label: 'Pull Selected Modules', command: 'sitecoreDevtools.pullSelectedModules', icon: 'checklist' },
            { label: 'Smart Sync', command: 'sitecoreDevtools.smartSync', icon: 'sync' },
            { label: 'Create Module', command: 'sitecoreDevtools.createModule', icon: 'new-file' }
        ]
    },
    {
        label: 'Plugins',
        icon: 'extensions',
        children: [
            { label: 'Add Plugin', command: 'sitecoreDevtools.pluginAdd', icon: 'add' },
            { label: 'Remove Plugin', command: 'sitecoreDevtools.pluginRemove', icon: 'trash' },
            { label: 'List Plugins', command: 'sitecoreDevtools.pluginList', icon: 'list-unordered' }
        ]
    },
    {
        label: 'Publishing',
        icon: 'globe',
        children: [
            { label: 'Publish', command: 'sitecoreDevtools.publish', icon: 'globe' },
            { label: 'Publish Site', command: 'sitecoreDevtools.publishSite', icon: 'browser' }
        ]
    },
    {
        label: 'Indexing',
        icon: 'search',
        children: [
            { label: 'Rebuild Index', command: 'sitecoreDevtools.indexRebuild', icon: 'refresh' },
            { label: 'Populate Index', command: 'sitecoreDevtools.indexPopulate', icon: 'database' },
            { label: 'Populate Index Schema', command: 'sitecoreDevtools.indexSchemaPopulate', icon: 'symbol-structure' }
        ]
    },
    {
        label: 'Packages',
        icon: 'package',
        children: [
            { label: 'Create Item Resource Package', command: 'sitecoreDevtools.packageCreate', icon: 'file-zip' },
            { label: 'Create Serialization Package', command: 'sitecoreDevtools.serPackageCreate', icon: 'archive' },
            { label: 'Install Serialization Package', command: 'sitecoreDevtools.serPackageInstall', icon: 'desktop-download' }
        ]
    },
    {
        label: 'XM Cloud',
        icon: 'cloud',
        children: [
            { label: 'List Projects', command: 'sitecoreDevtools.cloudProjectList', icon: 'folder' },
            { label: 'List Environments', command: 'sitecoreDevtools.cloudEnvironmentList', icon: 'server-environment' },
            { label: 'Create Deployment', command: 'sitecoreDevtools.cloudDeploymentCreate', icon: 'rocket' },
            { label: 'List Deployments', command: 'sitecoreDevtools.cloudDeploymentList', icon: 'list-tree' }
        ]
    }
];

export class CliCommandTreeItem extends vscode.TreeItem {
    constructor(
        public readonly item: CliCommandItem,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(item.label, collapsibleState);
        this.iconPath = new vscode.ThemeIcon(item.icon);
        
        if (item.command) {
            this.command = {
                command: item.command,
                title: item.label
            };
        }

        this.contextValue = item.children ? 'category' : 'command';
    }
}

export class CliCommandsTreeProvider implements vscode.TreeDataProvider<CliCommandTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<CliCommandTreeItem | undefined | null | void> = 
        new vscode.EventEmitter<CliCommandTreeItem | undefined | null | void>();
    
    readonly onDidChangeTreeData: vscode.Event<CliCommandTreeItem | undefined | null | void> = 
        this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: CliCommandTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: CliCommandTreeItem): Thenable<CliCommandTreeItem[]> {
        if (element) {
            if (element.item.children) {
                return Promise.resolve(
                    element.item.children.map(child => 
                        new CliCommandTreeItem(child, vscode.TreeItemCollapsibleState.None)
                    )
                );
            }
            return Promise.resolve([]);
        }

        return Promise.resolve(
            CLI_COMMANDS.map(item => 
                new CliCommandTreeItem(
                    item, 
                    item.children ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
                )
            )
        );
    }
}
