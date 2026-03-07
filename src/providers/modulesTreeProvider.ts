import * as vscode from "vscode";
import { Module } from "../models/module";
import { ModuleTreeItem } from "../ui/moduleTreeItem";
import { ModuleScannerService } from "../services/moduleScannerService";
import { Logger } from "../utils/logger";

export class ModulesTreeProvider
  implements
    vscode.TreeDataProvider<ModuleTreeItem>,
    vscode.TreeCheckboxChangeEvent<ModuleTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    ModuleTreeItem | undefined | null | void
  > = new vscode.EventEmitter<ModuleTreeItem | undefined | null | void>();

  readonly onDidChangeTreeData: vscode.Event<
    ModuleTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private modules: Module[] = [];
  private moduleScannerService: ModuleScannerService;
  private checkedModules: Set<string> = new Set();
  readonly items: ReadonlyArray<
    [ModuleTreeItem, vscode.TreeItemCheckboxState]
  > = [];

  constructor() {
    this.moduleScannerService = new ModuleScannerService();
  }

  public async refresh(): Promise<void> {
    Logger.info("Refreshing modules list...");
    this.modules = await this.moduleScannerService.scanModules();
    this._onDidChangeTreeData.fire();
  }

  public getModules(): Module[] {
    return this.modules;
  }

  public getCheckedModules(): Module[] {
    return this.modules.filter((m) => this.checkedModules.has(m.name));
  }

  public isModuleChecked(moduleName: string): boolean {
    return this.checkedModules.has(moduleName);
  }

  public setModuleChecked(moduleName: string, checked: boolean): void {
    if (checked) {
      this.checkedModules.add(moduleName);
    } else {
      this.checkedModules.delete(moduleName);
    }
    this._onDidChangeTreeData.fire();
  }

  public toggleModuleChecked(moduleName: string): void {
    if (this.checkedModules.has(moduleName)) {
      this.checkedModules.delete(moduleName);
    } else {
      this.checkedModules.add(moduleName);
    }
    this._onDidChangeTreeData.fire();
  }

  public selectAllModules(): void {
    this.modules.forEach((m) => this.checkedModules.add(m.name));
    this._onDidChangeTreeData.fire();
  }

  public deselectAllModules(): void {
    this.checkedModules.clear();
    this._onDidChangeTreeData.fire();
  }

  public getCheckedModuleNames(): string[] {
    return Array.from(this.checkedModules);
  }

  getTreeItem(element: ModuleTreeItem): vscode.TreeItem {
    element.checkboxState = this.checkedModules.has(element.module.name)
      ? vscode.TreeItemCheckboxState.Checked
      : vscode.TreeItemCheckboxState.Unchecked;
    return element;
  }

  async getChildren(element?: ModuleTreeItem): Promise<ModuleTreeItem[]> {
    if (element) {
      return [];
    }

    if (this.modules.length === 0) {
      this.modules = await this.moduleScannerService.scanModules();
    }

    return this.modules.map((module) => new ModuleTreeItem(module));
  }

  public getModuleByName(name: string): Module | undefined {
    return this.modules.find((m) => m.name === name);
  }

  public handleCheckboxChange(
    item: ModuleTreeItem,
    state: vscode.TreeItemCheckboxState,
  ): void {
    if (state === vscode.TreeItemCheckboxState.Checked) {
      this.checkedModules.add(item.module.name);
    } else {
      this.checkedModules.delete(item.module.name);
    }
  }
}
