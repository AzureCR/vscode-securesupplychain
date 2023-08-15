import { notationSign } from './images/notationSign';
import * as vscode from 'vscode';
import { IRemoteTagTreeItem } from '../utils/DockerInstances';
import { defaultSign } from './images/defaultSignImage';


export function registerCommands() {

    vscode.commands.registerCommand('securesupplychain.defaultKey', 
	async (remoteTag: IRemoteTagTreeItem) => {
		await defaultSign(remoteTag);
		}
	);
}
