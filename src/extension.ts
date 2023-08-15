import * as vscode from 'vscode';
import { showReferrers } from './commands/images/showReferrer';
import { registerCommands } from './commands/registerCommands';
import { IRemoteTagTreeItem } from './utils/DockerInstances';

export function activate(context: vscode.ExtensionContext ) {

	registerCommands();

	context.subscriptions.push(vscode.commands.registerCommand('securesupplychain.showReferrers',
		async (remoteTag: IRemoteTagTreeItem) => { /** When a user interacts with the docker UI and triggers the command, 
		the docker extension passes an instance of itself as a parameter to the command callback function in this extension. 
		This then gives us access to the properties and methods that are received and
		we take the fullTag and parent property. */
			await showReferrers(remoteTag); 
		}
	));	
}
