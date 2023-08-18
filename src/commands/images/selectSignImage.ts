import * as vscode from 'vscode';
import { logInToDockerCli } from '../registries/logInToDockerCli';
import { checkCLI } from '../../utils/checkCLI';
import { execAsync } from '../../utils/execAsync';

const cliName = 'notation';
const goToNotaryButton = 'Download Notary';
const NotaryURL = 'https://notaryproject.dev/docs/installation/cli/';
const errorMessage = `Notary not found: `;

async function sortOutput(theArray: any ){
    const dataArray = new Array();
    var keyChoices = theArray.stdout.split("\n");
    for (let i = 1; i < keyChoices.length; i++) { 
      const values = keyChoices[i].trim().split(/ {2,} /); 
      var itemObject; 
      for (let j = 0; j < 1; j++) { 
        const value = values[j];
        if (value.indexOf('*')> -1){
            const keyWithoutAsterisk = value.replace('* ', '');
            itemObject = {label: keyWithoutAsterisk, description: "Current default"};
        } else {
            itemObject = {label: value};
        }
      }
      dataArray.push(itemObject);
    }
    return dataArray;
}

async function addNewKey() { 
    var Key_Name = await vscode.window.showInputBox({prompt: "Input the key name"});
    var AKV_NAME = await vscode.window.showInputBox({prompt: "Input the azure key vault name"});
    if (Key_Name == undefined) {
        return; // Exit the function
    } else if (AKV_NAME == undefined){
        return;
    }else {
        var Key_ID = await execAsync(`az keyvault certificate show -n ${Key_Name} --vault-name ${AKV_NAME} --query "kid" -o tsv`);
        var output = await execAsync(`${cliName} key add --plugin azure-kv --id ${Key_ID.stdout} ${Key_Name}`);
        if(output.stdout){
            vscode.window.showInformationMessage("Key added");
        }else{ 
            vscode.window.showErrorMessage(output.stderr);
        }
    }    
}

export async function selectSigning(imageTag: any): Promise<void> { 
    await logInToDockerCli(imageTag.parent);
    var notaryCli = await checkCLI(cliName);
    if (notaryCli){
        var keyList = await execAsync(`${cliName} key list`);
        if (keyList.stdout){
            var keyArray = await sortOutput(keyList);
            const pick = await vscode.window.showQuickPick( [{label: "Add new Azure key"}, ...keyArray], {
                ignoreFocusOut : true,
                placeHolder : "Select a key to set as default.",
            });
            if (pick == undefined){
                return;
            }else if(pick.label.indexOf('Add new') > -1){
                await addNewKey();
            }else if (pick) {
                const progressOptions: vscode.ProgressOptions = {
                    location: vscode.ProgressLocation.Notification,
                    title: vscode.l10n.t('Setting key as default...'),
                };
                await vscode.window.withProgress(progressOptions, async () => {
                    const selectedItem = pick.label;
                    var errOut = await execAsync(`${cliName} key set --default "${selectedItem}"`);
                    if(errOut.stdout){
                        vscode.window.showInformationMessage(`${selectedItem} is now default key`);
                    }else{
                        vscode.window.showErrorMessage(errOut.stderr);
                    }
                });
            }else {
                vscode.window.showInformationMessage("no key selected");
            }
        }
    }else {
        vscode.window.showErrorMessage(errorMessage, goToNotaryButton)
            .then(selection => {
                if (selection === goToNotaryButton) {
                    vscode.env.openExternal(vscode.Uri.parse(NotaryURL));
                } 
            });
    }

}
