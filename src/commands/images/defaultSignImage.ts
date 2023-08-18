import * as vscode from 'vscode';
import { logInToDockerCli } from '../registries/logInToDockerCli';
import { checkCLI } from '../../utils/checkCLI';
import { execAsync } from '../../utils/execAsync';


const cliName = 'notation';
const goToNotaryButton = 'Download Notary';
const NotaryURL = 'https://notaryproject.dev/docs/installation/cli/';
const errorMessage = `Notary not found: `;

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
        vscode.window.showErrorMessage(errorMessage, goToNotaryButton)
            .then(selection => {
                if (selection === goToNotaryButton) {
                    vscode.env.openExternal(vscode.Uri.parse(NotaryURL));
                } 
            });
     }  
}