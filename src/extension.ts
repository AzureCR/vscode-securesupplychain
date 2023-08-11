import * as vscode from 'vscode';
import { showReferrers } from './commands/images/showReferrer';
import { registerCommands } from './commands/registerCommands';
import { IRemoteTagTreeItem } from './utils/DockerInstances';

/**  This interface declares that any object of type IRemoteTreeItem should have a 
 * fullTag property of type string and parent of type any. It defines the objects that 
 * are expected to be passed to the command async callback function.
 */  
// export interface IRemoteTagTreeItem {
// 	//the tag of an image thats passed to the oras command
// 	readonly fullTag: string;
// 	//the node of an image passed to get login credentials
// 	readonly parent: any;
// }


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
