import * as vscode from 'vscode';
import { logInToDockerCli } from '../registries/logInToDockerCli';
import { checkCLI } from '../../utils/checkCLI';

const cliName = 'notation';
const goToNotaryButton = 'Download Notary';
const orasURL = 'https://notaryproject.dev/docs/installation/cli/';
const errorMessage = `Notary not found: `;

export async function notationSign(imageTag: any): Promise<void> {
    await logInToDockerCli(imageTag.parent);
    var notaryCli = await checkCLI(cliName);
    if(notaryCli) {
        const choices = [
            "first name",
            "last name",
            "full name"
        ];
        
        const pick = await vscode.window.showQuickPick(choices, {
            ignoreFocusOut :true,
            canPickMany: false,
        })

        if (pick){
            const selectedItem = pick;
            await signingSelection(selectedItem);
        }else {
            vscode.window.showInformationMessage("no option selected")
        }
    } else {
        vscode.window.showErrorMessage(errorMessage, goToNotaryButton)
            .then(selection => {
                if (selection === goToNotaryButton) {
                    vscode.env.openExternal(vscode.Uri.parse(orasURL));
                } 
            });
     }  
}

async function signingSelection (option: any) {
    vscode.window.showInformationMessage( "Hello " + option);
}