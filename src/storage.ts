import { ExtensionContext } from "vscode";
import { RegexpAssigns } from "./assigns";
import { ViewColumnsToIdTable } from "./correlation";

export function retrieveRegexpAssigns(context: ExtensionContext): RegexpAssigns {
  return context.workspaceState.get<RegexpAssigns>("wing-rail.regexpAssigns", {});
}

export async function saveRegexpAssigns(context: ExtensionContext, assigns: RegexpAssigns) {
  await context.workspaceState.update("wing-rail.regexpAssigns", assigns);
}

export function retrieveViewColumnsToIdTable(context: ExtensionContext): ViewColumnsToIdTable {
  const persistedViewColumnsToId = context.workspaceState.get<ViewColumnsToIdTable>(
    "wing-rail.correlationTable.viewColumnsToId",
    {}
  );

  return Object.entries(persistedViewColumnsToId).reduce((agg, entry) => {
    return { ...agg, [parseInt(entry[0])]: entry[1] };
  }, {});
}

export async function saveViewColumnsToIdTable(context: ExtensionContext, viewColumnsToId: ViewColumnsToIdTable) {
  context.workspaceState.update("wing-rail.correlationTable.viewColumnsToId", viewColumnsToId);
}
