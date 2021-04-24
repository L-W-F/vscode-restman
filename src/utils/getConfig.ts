import { workspace } from 'vscode';

export const getConfig = (key: string, defaultValue?: any) =>
  workspace.getConfiguration('restman').get(key, defaultValue);
