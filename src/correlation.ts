import { ExtensionContext, TabGroup } from "vscode";

type IdsToGroupHashTable = {
  [k: string]: string;
};

export type ViewColumnsToIdTable = {
  [k: number]: string;
};

export type CorrelationTable = {
  idsToGroupHash: IdsToGroupHashTable;
  viewColumnsToId: ViewColumnsToIdTable;
};

function getGroupHash(group: TabGroup): string {
  return group.tabs
    .map((tab) => tab.label)
    .sort()
    .join(",");
}

function rebuildIdsToGroupHash(viewColumnsToId: ViewColumnsToIdTable, tabGroups: readonly TabGroup[]) {
  const idsToGroupHash: IdsToGroupHashTable = {};

  tabGroups.forEach((tabGroup) => {
    const id = viewColumnsToId[tabGroup.viewColumn] || crypto.randomUUID();
    const hash = getGroupHash(tabGroup);

    idsToGroupHash[id] = hash;
  });

  return idsToGroupHash;
}

function rebuildViewColumnsToId(idsToGroupHash: IdsToGroupHashTable, tabGroups: readonly TabGroup[]) {
  const viewColumnsToId: ViewColumnsToIdTable = {};

  tabGroups.forEach((tabGroup) => {
    const groupId = findGroupIdByHash(tabGroup, idsToGroupHash) || crypto.randomUUID();
    viewColumnsToId[tabGroup.viewColumn] = groupId;
  });

  return viewColumnsToId;
}

function findGroupIdByHash(group: TabGroup, idsToGroupHash: IdsToGroupHashTable): string | undefined {
  const groupHash = getGroupHash(group);
  const entry = Object.entries(idsToGroupHash).find((v) => v[1] === groupHash);

  return entry?.[0];
}

export function getIdByViewColumn({ viewColumnsToId }: CorrelationTable, viewColumn: number): string | undefined {
  return viewColumnsToId[viewColumn];
}

export function findViewColumnById({ viewColumnsToId }: CorrelationTable, id: string): number | undefined {
  const entry = Object.entries<string>(viewColumnsToId).find((v) => v[1] === id);

  if (entry) {
    return parseInt(entry[0]);
  }

  return undefined;
}

export function rebuildCorrelationTableFromIdsToGroupHash(
  idsToGroupHash: IdsToGroupHashTable,
  tabGroups: readonly TabGroup[]
): CorrelationTable {
  const viewColumnsToId = rebuildViewColumnsToId(idsToGroupHash, tabGroups);
  const newIdsToGroupHash = rebuildIdsToGroupHash(viewColumnsToId, tabGroups);

  return { idsToGroupHash: newIdsToGroupHash, viewColumnsToId };
}

export function rebuildCorrelationTableFromViewColumnsToId(
  sourceViewColumnsToId: ViewColumnsToIdTable,
  tabGroups: readonly TabGroup[]
): CorrelationTable {
  const idsToGroupHash = rebuildIdsToGroupHash(sourceViewColumnsToId, tabGroups);
  const viewColumnsToId = rebuildViewColumnsToId(idsToGroupHash, tabGroups);

  return { idsToGroupHash, viewColumnsToId };
}

export function rehashCorrelationTable(
  viewColumnsToId: ViewColumnsToIdTable,
  tabGroups: readonly TabGroup[]
): CorrelationTable {
  const newIdsToGroupHash = rebuildIdsToGroupHash(viewColumnsToId, tabGroups);

  return { idsToGroupHash: newIdsToGroupHash, viewColumnsToId };
}
