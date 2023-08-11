import * as vscode from 'vscode';
import { IRemoteTagTreeItem } from '../../utils/DockerInstances';



interface IAuthentication {
    getDockerCliCredentials : () => any; 
}

export async function logInToDockerCli(imageTag : any) {

    let loginProvider  : IAuthentication = {
        getDockerCliCredentials : async () => {
            let node = imageTag.parent;
            return await node.authHelper.getDockerCliCredentials(node.cachedProvider, node.authContext);
        }}; 
	    await vscode.commands.executeCommand('vscode-docker.registries.logInToDockerCli', loginProvider);
}