import * as vscode from 'vscode';
import { showReferrers } from './commands/showReferrer';

/**  This interface declares that any object of type IRemoteTreeItem should have a 
 * fullTag property of type string. It defines the type of an object that 
 * is expected to be passed to our command async callback function.
 */  
export interface IRemoteTagTreeItem {
	readonly fullTag: string;
	readonly parent: any;
}


export function activate(context: vscode.ExtensionContext ) {
	context.subscriptions.push(vscode.commands.registerCommand('securesupplychain.showReferrers',
		async (remoteTag: IRemoteTagTreeItem) => { /** When a user interacts with the docker UI and triggers the command, 
		the docker extension passes an instance of itself as a parameter to the command callback function in this extension. 
		This then gives us access to the properties and methods that are received and
		we take the fullTag and parent property since our interface has specified the expected shape of the object passed into the
		parameter. */
			await showReferrers(remoteTag); 
		}
	));
}
