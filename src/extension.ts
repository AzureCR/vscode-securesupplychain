import * as vscode from 'vscode';
import { selectSigning } from './commands/images/selectSignImage';
import { IDockerInstance } from './utils/DockerInstances';
import { defaultSign } from './commands/images/defaultSignImage';
import { showReferrers } from './commands/images/showReferrer';

export function activate(context: vscode.ExtensionContext ) {

	context.subscriptions.push(vscode.commands.registerCommand('securesupplychain.showReferrers',
		async (remoteTag: IDockerInstance) => { /** When a user interacts with the docker UI and triggers the command, 
		the docker extension passes an instance of itself as a parameter to the command callback function in this extension. 
		This then gives us access to the properties and methods that are received and
		we take the fullTag and parent property. */
			await showReferrers(remoteTag); 
		}
	));	

	context.subscriptions.push(vscode.commands.registerCommand('securesupplychain.defaultKey', 
	async (remoteTag: IDockerInstance) => {
		await defaultSign(remoteTag);
		}
	));

	context.subscriptions.push(vscode.commands.registerCommand('securesupplychain.allKeys', 
	async (remoteTag: IDockerInstance) => {
		await selectSigning(remoteTag);
		}
	));
}
