import { selectSigning } from './images/selectSignImage';
import * as vscode from 'vscode';
import { IRemoteTagTreeItem } from '../utils/DockerInstances';
import { defaultSign } from './images/defaultSignImage';
import { showReferrers } from './images/showReferrer';



export function registerCommands() {

	vscode.commands.registerCommand('securesupplychain.showReferrers',
		async (remoteTag: IRemoteTagTreeItem) => { /** When a user interacts with the docker UI and triggers the command, 
		the docker extension passes an instance of itself as a parameter to the command callback function in this extension. 
		This then gives us access to the properties and methods that are received and
		we take the fullTag and parent property. */
			await showReferrers(remoteTag); 
		}
	);	

    vscode.commands.registerCommand('securesupplychain.defaultKey', 
	async (remoteTag: IRemoteTagTreeItem) => {
		await defaultSign(remoteTag);
		}
	);

	vscode.commands.registerCommand('securesupplychain.allKeys', 
	async (remoteTag: IRemoteTagTreeItem) => {
		await selectSigning(remoteTag);
		}
	);
}
