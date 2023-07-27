// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { showReferrer } from './commands/showReferrer';

interface RemoteTagTreeItem {
	readonly fullTag: string;
}

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('annaPrototype.showReferrer',
		async (remoteTag: RemoteTagTreeItem) => {
			const result = await showReferrer(remoteTag);
			console.log( 'extension output:' + result);
		}
	));
}
