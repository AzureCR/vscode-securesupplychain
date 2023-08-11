import { notationSign } from './images/notationSign';
import * as vscode from 'vscode';
import { IRemoteTagTreeItem } from '../utils/DockerInstances';


export function registerCommands() {

    vscode.commands.registerCommand('securesupplychain.submenu', 
	async (remoteTag: IRemoteTagTreeItem) => {
		await notationSign(remoteTag);
		}
	);
}
