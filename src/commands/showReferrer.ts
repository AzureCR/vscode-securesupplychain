import * as vscode from 'vscode';
import { execAsync } from '../support/execAsync';
import { window } from 'vscode';
import * as os from 'os';
import * as path from 'path';
import { access } from 'fs/promises'; 

const goToOrasButton = 'Download ORAS';
const validTag = /^[a-z0-9./_:-]+$/; 
const orasURL = 'https://oras.land/docs/installation';

/* checks that oras exists on user computer through building a default path and checking 
 * the path exists. Path is the configured oras directory and bool states if the path exists (true) or doesn't (false).
 */
async function getOrasPath(path: any, bool : boolean): Promise<[string, boolean]> {
    var isWindows = os.platform() === 'win32'; 
    var homedir = os.homedir(); 
    var orasExecutable = isWindows ? 'oras.exe' : 'oras'; 
    var dirOras = path.join(homedir, 'bin', 'oras', orasExecutable);
    var errorMessage = `ORAS not found on default path "${dirOras}". Download ORAS or update path: `;

        try {
            await access(dirOras);
            return [dirOras , true];
        } catch {
            vscode.window.showInformationMessage(errorMessage, goToOrasButton)
            .then(selection => {
                if (selection === goToOrasButton) {
                    vscode.env.openExternal(vscode.Uri.parse(orasURL));
                } 
            });
            return [dirOras, false];
        } 
}
/**
 * an interface that builds the method getDockerCLiCredentials and returns object type any.
 * We need this to mimic the Docker extensions logInToDockerCli code : node.getDockerCliCredentials because we
 * can't get the function itself through the instance of the docker extension.
 */
interface IAuthentication {
    getDockerCliCredentials : () => any; 
}

/**
 * lists referrers for a given tag in a separate vscode window.
 */
export async function showReferrers(imageTag: any): Promise<void> {
    /**
     *  https://github.com/microsoft/vscode-docker/blob/main/src/commands/registries/logInToDockerCli.ts
     *  https://github.com/microsoft/vscode-docker/blob/main/src/tree/registries/dockerV2/DockerV2RegistryTreeItemBase.ts#L64
     * loginProvider is an object of type IAuthentication and contains the async method getDockerCliCredentials
     * which builds the node of the RegistryTreeItemBase out of the object from imageTag.parent.
     * Then awaits the return of the nodes authHelper, which holds the function getDockerCLiCredentials and takes parameters of
     * the node cachedProvider and node authContext. These returned items are then run through the Dockers logInToDockerCli as
     * the login credentials.
     */
    let loginProvider  : IAuthentication = {
        getDockerCliCredentials : async () => {
            let node = imageTag.parent;
            return await node.authHelper.getDockerCliCredentials(node.cachedProvider, node.authContext);
        }}; 
	    await vscode.commands.executeCommand('vscode-docker.registries.logInToDockerCli', loginProvider);

    var orasPathTuple = await getOrasPath(path, true);
    var orasPath = orasPathTuple[0];
    var orasExists = orasPathTuple[1];

    try {
        if(orasExists) {
            if (validTag.test(imageTag.fullTag)){
                var exportCommand = `"${orasPath}" discover -o tree "${imageTag.fullTag}"`; 
                var output = await execAsync(exportCommand)

                if(!output.stderr){
                    vscode.workspace.openTextDocument({ content: output.stdout }).then(doc => {
                    // Show the newly created document in the editor
                    vscode.window.showTextDocument(doc);
                    });
                }
            }else{
                window.showErrorMessage('Invalid Tag provided');
            }
        }  
    } catch (err) {
        window.showErrorMessage('Error tag not found');
    }
}
