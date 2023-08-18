import * as vscode from 'vscode';
import { logInToDockerCli } from './registries/logInToDockerCli';
import { checkCLI } from '../utils/checkCLI';
import { execAsync } from '../utils/execAsync';


const cliName = 'notation';
const goToNotationButton = 'Download Notation';
const NotationURL = 'https://notaryproject.dev/docs/installation/cli/';
const errorMessage = `Notation not found: `;

//signs image with default key
export async function defaultSign(imageTag: any): Promise<void> {
    await logInToDockerCli(imageTag.parent);
    var notaryCli = await checkCLI(cliName);
    if(notaryCli) {
            const progressOptions: vscode.ProgressOptions = {
                location: vscode.ProgressLocation.Notification,
                title: vscode.l10n.t('Signing...'),
            };
            await vscode.window.withProgress(progressOptions, async () => {
                var errOut = await execAsync(`${cliName} sign ${imageTag.fullTag}`); //TODO: referrence image by digest not tag
                if(errOut.stdout){
                    vscode.window.showInformationMessage("Image signed")
                }else{
                    vscode.window.showErrorMessage(errOut.stderr)
                }
            });
    } else {
        vscode.window.showErrorMessage(errorMessage, goToNotationButton)
            .then(selection => {
                if (selection === goToNotationButton) {
                    vscode.env.openExternal(vscode.Uri.parse(NotationURL));
                } 
            });
     }  
}