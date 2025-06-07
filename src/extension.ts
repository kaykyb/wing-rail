import * as vscode from "vscode";
import { Controller } from "./controller";

export function activate(context: vscode.ExtensionContext) {
  const controller = new Controller(context);

  const didChangeTabsEv = vscode.window.tabGroups.onDidChangeTabs((e) => {
    controller.handleDidChangeTabs(e);
  });

  const didChangeTabGroupsEv = vscode.window.tabGroups.onDidChangeTabGroups((e) => {
    controller.handleDidChangeTabGroups(e);
  });

  const bindRegexpCmd = vscode.commands.registerCommand("wing-rail.bindRegexToActiveGroup", () =>
    controller.handleBindRegexCommand()
  );

  const bindCurrentFileExtensionCmd = vscode.commands.registerCommand(
    "wing-rail.bindActiveFileExtensionToActiveGroup",
    () => controller.handleBindActiveFileExtensionCommand()
  );

  const clearActiveGroupBindsCmd = vscode.commands.registerCommand("wing-rail.clearActiveGroupBinds", () =>
    controller.handleClearActiveGroupBindsCommand()
  );

  const clearActiveFileExtensionBindsCmd = vscode.commands.registerCommand(
    "wing-rail.clearActiveFileExtensionBinds",
    () => controller.handleClearActiveFileExtensionBindsCommand()
  );

  const clearRegexpsCmd = vscode.commands.registerCommand("wing-rail.clearWorkspaceBinds", () =>
    controller.handleClearRegexpsCommand()
  );

  context.subscriptions.push(
    didChangeTabsEv,
    didChangeTabGroupsEv,
    bindRegexpCmd,
    bindCurrentFileExtensionCmd,
    clearActiveGroupBindsCmd,
    clearActiveFileExtensionBindsCmd,
    clearRegexpsCmd
  );
}

export function deactivate() {}
