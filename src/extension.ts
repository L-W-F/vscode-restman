import { ExtensionContext, languages, workspace } from 'vscode';
import { registerExecuteCommand } from './commands/execute';
import { registerRequestCommand } from './commands/request';
import { registerFormatCommand } from './commands/format';
import { registerFakerCommand } from './commands/faker';
import { registerPreviewCommand } from './commands/preview';
import { registerGenerateCommand } from './commands/generate';
import { ExecuteProvider } from './providers/ExecuteProvider';
import { FormatProvider } from './providers/FormatProvider';
import { FakerProvider } from './providers/FakerProvider';
import { EnvHoverProvider } from './providers/EnvHoverProvider';
import { lintService } from './services/lintService';
import { mockService } from './services/mockService';
import { envStore } from './stores/envStore';
import { mockStore } from './stores/mockStore';
import { getConfig } from './utils/getConfig';
import { debug } from './utils/debug';

const subscriptions: { dispose(): any }[] = [];

async function startup() {
  subscriptions.push(languages.registerCodeLensProvider({ language: 'rest' }, new ExecuteProvider()));
  subscriptions.push(languages.registerCodeLensProvider({ language: 'rest' }, new FormatProvider()));
  subscriptions.push(languages.registerCodeLensProvider({ language: 'rest' }, new FakerProvider()));
  subscriptions.push(languages.registerHoverProvider({ language: 'rest' }, new EnvHoverProvider()));

  subscriptions.push(registerExecuteCommand());
  subscriptions.push(registerRequestCommand());
  subscriptions.push(registerFormatCommand());
  subscriptions.push(registerFakerCommand());
  subscriptions.push(registerPreviewCommand());
  subscriptions.push(registerGenerateCommand());

  subscriptions.push(lintService.initialize());
  subscriptions.push(await envStore.initialize());

  if (getConfig('mockServer')) {
    subscriptions.push(await mockStore.initialize());
    subscriptions.push(mockService.initialize());
  }
}

async function dispose() {
  subscriptions.forEach((s) => {
    s.dispose();
  });
}

export async function activate(ctx: ExtensionContext) {
  debug('RESTMAN', 'activating...');

  try {
    if (getConfig('enable', true)) {
      await startup();
    } else {
      debug('RESTMAN', 'extension is disabled');
    }

    ctx.subscriptions.push(
      workspace.onDidChangeConfiguration(async (e) => {
        if (e.affectsConfiguration('restman.enable')) {
          if (getConfig('enable')) {
            await startup();
          } else {
            await dispose();
          }
        } else if (e.affectsConfiguration('restman.mockServer')) {
          if (getConfig('enable')) {
            if (getConfig('mockServer')) {
              subscriptions.push(await mockStore.initialize());
              subscriptions.push(mockService.initialize());
            } else {
              mockStore.dispose();
              mockService.dispose();
            }
          }
        }
      }),
    );

    debug('RESTMAN', 'activated!');
  } catch (error) {
    debug('RESTMAN', error.message);
  }
}

export async function deactivate(ctx: ExtensionContext) {
  await dispose();
  debug('RESTMAN', 'deactivated!');
}
