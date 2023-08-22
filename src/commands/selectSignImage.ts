import * as vscode from 'vscode';
import { logInToDockerCli } from './registries/logInToDockerCli';
import { checkCli } from '../utils/checksCli';
import { execAsync } from '../utils/execAsync';

const cliName = 'notation';
const goToNotationButton = 'Download Notation';
const NotationURL = 'https://notaryproject.dev/docs/installation/cli/';
const errorMessage = `Notation not found: `;

//transforms the key list string into an array of objects
/**
 * Parsing the string is necessary because the current notation output
 * is a tabular string, thus not formatted for immediate use. 
 */
async function sortOutput(Key_String_Values: string ){
    //if the key_string_values is empty
    if(Key_String_Values == ""){
        return "No current keys in notation";
    }else {
        var dataArray = new Array();
        var keyChoices = Key_String_Values.split("\n");
        for (let i = 1; i < keyChoices.length; i++) { 
            var values = keyChoices[i].trim().split(/ {2,} /); 
            var itemObject; 
            var value = values[0];
            if (value.indexOf('*')> -1){
                const keyWithoutAsterisk = value.replace('* ', '');
                itemObject = {label: keyWithoutAsterisk, description: "Current default"};
            } else {
                itemObject = {label: value};
            }  
            dataArray.push(itemObject);
        }
        return dataArray;
    }
}

//adds precreated azure key to notation
async function addNewKey() { 
    var key_Name = await vscode.window.showInputBox({prompt: "Input the key name"});
    //If the user escapes or enters an empty string in the inputbox, then exit the function
    if(key_Name == undefined || key_Name == ''){
        return;
    }

    var akv_Name = await vscode.window.showInputBox({prompt: "Input the azure key vault name"});
    if (akv_Name == undefined ||  akv_Name == '') {
        return; // Exit the function
    }

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

//supports user adding keys and setting default
export async function selectSigning(imageTag: any): Promise<void> { 
    await logInToDockerCli(imageTag.parent);
    var notationCli = await checkCli(cliName);
    if (notationCli){
        var keyList = await execAsync(`${cliName} key list`);
        //Note that 'notation key list' does not usually error out and will always return an output string.
        if (keyList.stderr){
            vscode.window.showErrorMessage(keyList.stderr);
        } else {
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
                    var setSuccess = await execAsync(`${cliName} key set --default "${selectedItem}"`);
                    if(setSuccess.stdout){
                        vscode.window.showInformationMessage(`${selectedItem} is now default key`);
                    }else{
                        vscode.window.showErrorMessage(setSuccess.stderr);
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
