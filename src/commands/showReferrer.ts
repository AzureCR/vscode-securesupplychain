/* eslint-disable @typescript-eslint/no-floating-promises */
import * as vscode from 'vscode';
import { execAsync } from '../utils/execAsync';
import { window } from 'vscode';
import { loginToDockerCli } from './registries/logInToDockerCli';
import { checkCli } from '../utils/checksCli';

const cliName = "oras";
const goToOrasButton = "Download ORAS";
const validTag = /^[a-z0-9./_:-]+$/; 
const orasURL = "https://oras.land/docs/installation";
const errorMessage = "oras executable/binary not in user's path environment variables. Download ORAS or update path: ";

/**
 * lists referrers for a given tag in a separate vscode window.
 */
export async function showReferrers(imageTag: any): Promise<void> {

    await loginToDockerCli(imageTag.parent)

    const orasPath = await checkCli(cliName);

    if(orasPath) {
        if (validTag.test(imageTag.fullTag)){
            const exportCommand = `${cliName} discover -o tree "${imageTag.fullTag}"`; 
            const output = await execAsync(exportCommand);

            if(!output.stderr){
                vscode.workspace.openTextDocument({ content: output.stdout }).then(doc => {
                vscode.window.showTextDocument(doc); // Show the newly created document in the editor
                });
            } else {
                window.showErrorMessage(output.stderr);
            }
        }else{
            window.showErrorMessage("Invalid Tag provided");
        }
    } else {
        vscode.window.showErrorMessage(errorMessage, goToOrasButton)
            .then(selection => {
                if (selection === goToOrasButton) {
                    vscode.env.openExternal(vscode.Uri.parse(orasURL));
                } 
            });
    } 
    
}
