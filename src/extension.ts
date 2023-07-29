// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { showReferrer } from './commands/showReferrer';

interface RemoteTagTreeItem {
	readonly fullTag: string;
}

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('securesupplychain.showReferrers',
		async (remoteTag: RemoteTagTreeItem) => {
			await showReferrer(remoteTag);
		}
	));
}
