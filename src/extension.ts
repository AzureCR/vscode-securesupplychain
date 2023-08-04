// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { showReferrers } from './commands/showReferrer';
//import {logInToDockerCli} from 'ms-azuretools.vscode-docker';

/**  This interface declares that any object of type IremoteTreeItem should have a 
 * fullTag property of type string. It defines the type of an object that 
 * is expected to be passed to our command async callback function.
 */  
interface IRemoteTagTreeItem {
	readonly fullTag: string;
}


export function activate(context: vscode.ExtensionContext) {
/** Registering the command with id 'securesupplychain.showReferrers' and giving it a async callback function
 * that takes parameter named remoteTag which will be an object conforming to IremoteTagTreeItem interface.
 */
	context.subscriptions.push(vscode.commands.registerCommand('securesupplychain.showReferrers',
		async (remoteTag: IRemoteTagTreeItem) => { /** When a user interacts with the docker UI and triggers the command, 
		the docker class RemoteTagTreeItem passes an instance of itself as a parameter to the command callback function in this extension. 
		This then gives us access to the properties and methods that are received from the RemoteTagTreeItem instance,
		we take the fullTag property since our interface has specified the expected shape of the object passed into the
		parameter. */
			await showReferrers(remoteTag); //we then send that object our showReferrer function and wait for it to complete.
		}
	));
}
