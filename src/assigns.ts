export type RegexpAssigns = {
  [regexp: string]: string;
};

function buildRegexp(regexp: string): RegExp {
  const flags = "i";
  return new RegExp(regexp, flags);
}

export function removeRegexpAssigns(assigns: RegexpAssigns, regexp: string): RegexpAssigns {
  const newEntries = Object.entries(assigns).filter((entry) => entry[0] !== regexp);
  return Object.fromEntries(newEntries);
}

export function addRegexpAssigns(assigns: RegexpAssigns, regexp: string, groupId: string): RegexpAssigns {
  return { ...assigns, [regexp]: groupId };
}

export function removeRegexpAssignsGroup(assigns: RegexpAssigns, groupId: string): RegexpAssigns {
  const newEntries = Object.entries(assigns).filter((entry) => entry[1] !== groupId);
  return Object.fromEntries(newEntries);
}

export function belongsToRegexpAssignsGroup(assigns: RegexpAssigns, path: string): string | undefined {
  const entry = Object.entries(assigns).find((v) => buildRegexp(v[0]).test(path));
  return entry?.[1];
}
