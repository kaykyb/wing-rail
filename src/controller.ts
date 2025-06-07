import * as vscode from "vscode";
import { ExtensionContext, TabChangeEvent, TabGroup, Tab, TabGroupChangeEvent, TabInputText } from "vscode";

import {
  CorrelationTable,
  findViewColumnById,
  getIdByViewColumn,
  rebuildCorrelationTableFromIdsToGroupHash,
  rehashCorrelationTable,
  rebuildCorrelationTableFromViewColumnsToId,
} from "./correlation";
import {
  addRegexpAssigns,
  belongsToRegexpAssignsGroup,
  RegexpAssigns,
  removeRegexpAssigns,
  removeRegexpAssignsGroup,
} from "./assigns";
import {
  retrieveRegexpAssigns,
  retrieveViewColumnsToIdTable,
  saveRegexpAssigns,
  saveViewColumnsToIdTable,
} from "./storage";

export class Controller {
  private correlationTable: CorrelationTable;
  private regexpAssigns: RegexpAssigns;

  private context: ExtensionContext;

  constructor(context: ExtensionContext) {
    this.context = context;

    const tabGroups = vscode.window.tabGroups.all;
    this.correlationTable = rebuildCorrelationTableFromViewColumnsToId(
      retrieveViewColumnsToIdTable(this.context),
      tabGroups
    );

    this.regexpAssigns = retrieveRegexpAssigns(context);

    saveViewColumnsToIdTable(this.context, this.correlationTable.viewColumnsToId);
  }

  private refreshCorrelationTable() {
    const tabGroups = vscode.window.tabGroups.all;
    const hasNewGroups = Object.keys(this.correlationTable.viewColumnsToId).length !== tabGroups.length;

    if (hasNewGroups) {
      this.correlationTable = rebuildCorrelationTableFromIdsToGroupHash(
        this.correlationTable.idsToGroupHash,
        tabGroups
      );

      saveViewColumnsToIdTable(this.context, this.correlationTable.viewColumnsToId);
    } else {
      this.correlationTable = rehashCorrelationTable(this.correlationTable.viewColumnsToId, tabGroups);
    }
  }

  private bindRegexpToGroup(regexpStr: string, group: TabGroup) {
    const groupId = getIdByViewColumn(this.correlationTable, group.viewColumn);
    if (!groupId) {
      console.error("Couldn't not find group id for tabGroups.", group);
    }

    this.regexpAssigns = addRegexpAssigns(this.regexpAssigns, regexpStr, groupId!);
    saveRegexpAssigns(this.context, this.regexpAssigns);
  }

  private async handleTabOpened(tab: Tab) {
    if (!(tab.input instanceof TabInputText)) {
      return;
    }

    const tabInput = tab.input as TabInputText;
    const path = tabInput.uri.path;

    const belongsToId = belongsToRegexpAssignsGroup(this.regexpAssigns, path);
    const currentGroupId = getIdByViewColumn(this.correlationTable, tab.group.viewColumn);

    if (!belongsToId || !currentGroupId || belongsToId === currentGroupId) {
      return;
    }

    const newViewColumn = findViewColumnById(this.correlationTable, belongsToId);
    if (!newViewColumn) {
      return;
    }

    await vscode.window.tabGroups.close(tab);
    const doc = await vscode.workspace.openTextDocument(tabInput.uri);
    await vscode.window.showTextDocument(doc, newViewColumn);
  }

  public handleDidChangeTabs(e: TabChangeEvent) {
    this.refreshCorrelationTable();

    e.opened.forEach(async (tab) => {
      await this.handleTabOpened(tab);
    });
  }

  public handleDidChangeTabGroups(_: TabGroupChangeEvent) {
    this.refreshCorrelationTable();
  }

  public async handleBindRegexCommand() {
    const regexpStr = await vscode.window.showInputBox({
      prompt: "Enter regular expression to assign to this tab group:",
      ignoreFocusOut: true,
      value: "^(.+)$",
    });

    if (!regexpStr) {
      return;
    }

    const group = vscode.window.tabGroups.activeTabGroup;
    this.bindRegexpToGroup(regexpStr, group);
  }

  public async handleBindActiveFileExtensionCommand() {
    const activeFilePath = vscode.window.activeTextEditor?.document.fileName;
    if (!activeFilePath) {
      return;
    }

    const pathParts = activeFilePath.split(".");
    const fileExtension = pathParts[pathParts.length - 1];

    const group = vscode.window.tabGroups.activeTabGroup;
    this.bindRegexpToGroup(`^(.+)\\.${fileExtension}$`, group);
  }

  public async handleClearActiveFileExtensionBindsCommand() {
    const activeFilePath = vscode.window.activeTextEditor?.document.fileName;
    if (!activeFilePath) {
      return;
    }

    const pathParts = activeFilePath.split(".");
    const fileExtension = pathParts[pathParts.length - 1];

    this.regexpAssigns = removeRegexpAssigns(this.regexpAssigns, `^(.+)\\.${fileExtension}$`);
  }

  public async handleClearActiveGroupBindsCommand() {
    const group = vscode.window.tabGroups.activeTabGroup;
    const currentGroupId = getIdByViewColumn(this.correlationTable, group.viewColumn);
    if (!currentGroupId) {
      return;
    }

    this.regexpAssigns = removeRegexpAssignsGroup(this.regexpAssigns, currentGroupId);
    saveRegexpAssigns(this.context, this.regexpAssigns);
  }

  public async handleClearRegexpsCommand() {
    this.regexpAssigns = {};
    saveRegexpAssigns(this.context, this.regexpAssigns);
  }
}
