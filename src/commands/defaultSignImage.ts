/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
import * as vscode from 'vscode';
import { loginToDockerCli } from './registries/logInToDockerCli';
import { checkCli } from '../utils/checksCli';
import { execAsync } from '../utils/execAsync';
import { sortOutput } from './selectSignImage'; 


const cliName = "notation";
const goToNotationButton = "Download Notation";
const NotationURL = "https://notaryproject.dev/docs/installation/cli/";
const errorMessage = "Notation not found: ";

//signs image with default key
export async function defaultSign(imageTag: any): Promise<void> {
    await loginToDockerCli(imageTag.parent);
    const notaryCli = await checkCli(cliName);
    if(notaryCli) {
        const keyList = await execAsync(`${cliName} key list`);
        //Note that 'notation key list' does not usually error out and will always return an output string.
        if (keyList.stderr){
            vscode.window.showErrorMessage(keyList.stderr);
        } else {
            const [ ,defaultKey]= await sortOutput(keyList.stdout);
            const progressOptions: vscode.ProgressOptions = {
                location: vscode.ProgressLocation.Notification,
                title: vscode.l10n.t(`Signing the image "${imageTag.tag}" with default key "${defaultKey}"...`),
            };
            await vscode.window.withProgress(progressOptions, async () => {
                const signSuccess = await execAsync(`${cliName} sign ${imageTag.fullTag}`); //TODO: referrence image by digest not tag
                if(signSuccess.stdout){
                    vscode.window.showInformationMessage("Image signed");
                }else{
                    vscode.window.showErrorMessage(signSuccess.stderr);
                }
            });
        }
    } else {
        vscode.window.showErrorMessage(errorMessage, goToNotationButton)
            .then(selection => {
                if (selection === goToNotationButton) {
                    vscode.env.openExternal(vscode.Uri.parse(NotationURL));
                } 
            });
     }  
}