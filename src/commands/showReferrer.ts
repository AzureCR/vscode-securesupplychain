import * as vscode from 'vscode';
import { IActionContext } from '@microsoft/vscode-azext-utils';
import { execAsync } from '../support/execAsync';
import { window } from 'vscode';
import * as os from 'os';
import * as path from 'path';
import { access } from 'fs/promises'; 
//TODO: Error Wrapping
const errorMessage = 'ORAS not found on default path. Download ORAS or update path: ';
const goToOrasLink = 'Download ORAS';
const laterButton = 'Later';
const validTag = /^[a-z0-9./_:-]+$/; 

// check oras exist on user computer
async function getOrasPath() {
    const isWindows = os.platform() === 'win32'; 
    const homedir = os.homedir(); 
    const orasExecutable = isWindows ? 'oras.exe' : 'oras'; 
    const dirOras = path.join(homedir, 'bin', 'oras', orasExecutable);

    try {
        await access(dirOras);
        return dirOras; 
    } catch (err) {
        vscode.window.showInformationMessage(errorMessage, goToOrasLink, laterButton)
            .then(selection => {
                if (selection === goToOrasLink) {
                    vscode.env.openExternal(vscode.Uri.parse('https://oras.land/docs/installation'));
                } else if (selection === laterButton){
                   //when they choose later it closes the toast 
                }
            });

        throw new Error();
    }
}
/**
 * an interface that builds the method getDockerCLiCredentials and returns object type any
 * we need this to mimic the Docker extensions logInToDockerCli code : node.getDockerCliCredentials because we
 * can't get the function itself through the instance we recieve we only get types.
 */
interface IAuthentication {
    getDockerCliCredentials : () => any; 
}


/**
 * showReferrer logs into docker cli, calls getOrasPath, checks that an image tag has only the valid characters it needs, 
 * sends the oras discover command to be executed, and has error handling
 * @param imageTag 
 */
export async function showReferrers(imageTag: any): Promise<void> {
    /**
     * loginProvider is an object of type IAuthentication and contains the async method getDockerCliCredentials
     * which builds the node of the RegistryTreeItemBase out of the object from imageTag.parent,
     * then awaiting the return of the nodes authHelper which holds the function getDockerCLiCredentials taking parameters of
     * the node cachedProvider and node authContext. These returned items are then run through the Dockers logInToDockerCli as
     * the login credentials.
     */
    let loginProvider  : IAuthentication = {
        getDockerCliCredentials : async () => {
            let node = imageTag.parent;
            return await node.authHelper.getDockerCliCredentials(node.cachedProvider, node.authContext);
        }}; 
	await vscode.commands.executeCommand('vscode-docker.registries.logInToDockerCli', loginProvider);


    try {
        const orasPath = await getOrasPath();

        if(validTag.test(imageTag.fullTag)){
            const exportCommand = `"${orasPath}" discover -o tree "${imageTag.fullTag}"`; //"${orasPath}"
            const output = await execAsync(exportCommand)

            if(!output.stderr){
                vscode.workspace.openTextDocument({ content: output.stdout }).then(doc => {
                    // Show the newly created document in the editor
                    vscode.window.showTextDocument(doc);
                });
            } else {
                window.showErrorMessage("Test:" + output.stderr);
            }
        } else {
            window.showErrorMessage('Invalid Tag provided');
        }
        
    } catch (error) {
        window.showErrorMessage("Test End Catch:" + error); //needed for command execution errors
    }
}
