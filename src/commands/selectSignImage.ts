import * as vscode from 'vscode';
import { logInToDockerCli } from './registries/logInToDockerCli';
import { checkCLI } from '../utils/checkCLI';
import { execAsync } from '../utils/execAsync';

const cliName = 'notation';
const goToNotationButton = 'Download Notation';
const NotationURL = 'https://notaryproject.dev/docs/installation/cli/';
const errorMessage = `Notation not found: `;

//transforms the key list string into an array of objects
async function sortOutput(Key_String_Values: string ){
    var dataArray = new Array();
    var keyChoices = Key_String_Values.split("\n");
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

//adds precreated azure key to notation
async function addNewKey() { 
    var key_Name = await vscode.window.showInputBox({prompt: "Input the key name"});
    var akv_Name = await vscode.window.showInputBox({prompt: "Input the azure key vault name"});
    if ((key_Name && akv_Name) == undefined || (key_Name && akv_Name) == '') {
        return; // Exit the function
    }else {
        const progressOptions: vscode.ProgressOptions = {
            location: vscode.ProgressLocation.Notification,
            title: vscode.l10n.t('Adding key...'),
        };
        await vscode.window.withProgress(progressOptions, async () => {
            var key_ID = await execAsync(`az keyvault certificate show -n ${key_Name} --vault-name ${akv_Name} --query "kid" -o tsv`);
            if(key_ID.stdout){
                var output = await execAsync(`${cliName} key add --plugin azure-kv --id ${key_ID.stdout} ${key_Name}`);
                if(output.stdout){
                    vscode.window.showInformationMessage("Key added");
                }else{ 
                    vscode.window.showErrorMessage(output.stderr);
                }
            } else{
                vscode.window.showErrorMessage("A key id was not found for the provided inputs. Please double check spelling.");
            }
        });  
    }    
}

//supports user adding keys and setting default
export async function selectSigning(imageTag: any): Promise<void> { 
    await logInToDockerCli(imageTag.parent);
    var notationCli = await checkCLI(cliName);
    if (notationCli){
        var keyList = await execAsync(`${cliName} key list`);
        if (keyList.stdout){
            var keyArray = await sortOutput(keyList.stdout);
            const pick = await vscode.window.showQuickPick( [{label: "Add new key from Azure Key Vault"}, ...keyArray], {
                ignoreFocusOut : true,
                placeHolder : "Select a key to set as default.",
            });
            if (pick == undefined){ //user escapes the selection
                return;
            }else if(pick.label.indexOf('Add new') > -1){ //if user picks to add a new key
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
        vscode.window.showErrorMessage(errorMessage, goToNotationButton)
            .then(selection => {
                if (selection === goToNotationButton) {
                    vscode.env.openExternal(vscode.Uri.parse(NotationURL));
                } 
            });
    }

}
