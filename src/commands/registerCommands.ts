import { selectSigning } from './images/selectSignImage';
import * as vscode from 'vscode';
import { IRemoteTagTreeItem } from '../utils/DockerInstances';
import { defaultSign } from './images/defaultSignImage';


export function registerCommands() {

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
