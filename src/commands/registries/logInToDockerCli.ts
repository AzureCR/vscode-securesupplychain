import * as vscode from 'vscode';

/**
 * an interface that builds the method getDockerCLiCredentials and returns object type any.
 * We need this to mimic the Docker extensions logInToDockerCli code : node.getDockerCliCredentials because we
 * can't get the function itself through the instance of the docker extension.
 */
interface IAuthentication {
    getDockerCliCredentials : () => any; 
}

export async function loginToDockerCli(imageTag : any) {

    /**
     *  https://github.com/microsoft/vscode-docker/blob/main/src/commands/registries/logInToDockerCli.ts
     *  https://github.com/microsoft/vscode-docker/blob/main/src/tree/registries/dockerV2/DockerV2RegistryTreeItemBase.ts#L64
     * loginProvider is an object of type IAuthentication and contains the async method getDockerCliCredentials
     * which builds the node of the RegistryTreeItemBase out of the object from imageTag.parent.
     * Then awaits the return of the nodes authHelper, which holds the function getDockerCLiCredentials and takes parameters of
     * the node cachedProvider and node authContext. These returned items are then run through the Dockers logInToDockerCli as
     * the login credentials.
     */
    const loginProvider : IAuthentication = {
        getDockerCliCredentials : async () => {
            const node = imageTag.parent;
            return await node.authHelper.getDockerCliCredentials(node.cachedProvider, node.authContext);
        }}; 
	await vscode.commands.executeCommand('vscode-docker.registries.logInToDockerCli', loginProvider);
}