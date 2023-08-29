/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
import * as vscode from 'vscode';
import { loginToDockerCli } from './registries/logInToDockerCli';
import { checkCli } from '../utils/checksCli';
import { execAsync } from '../utils/execAsync';

const cliName = "notation";
const goToNotationButton = "Download Notation";
const NotationURL = "https://notaryproject.dev/docs/installation/cli/";
const errorMessage = "Notation not found: ";


/**
 * Parsing the string is necessary because the current notation output
 * is a tabular string, thus not formatted for immediate use. 
 * Thus the function changes the key list string into an array of objects
 */
export async function sortOutput(keyStringValues: string ){
    //if the key_string_values is empty
    if(keyStringValues === ""){
        return "No current keys in notation";
    }else {
        // eslint-disable-next-line @typescript-eslint/no-array-constructor
        const dataArray = new Array();
        let defaultKey = '';
        const keyChoices = keyStringValues.split("\n");
        for (let i = 1; i < keyChoices.length; i++) { 
            const values = keyChoices[i].trim().split(/ {2,} /); 
            let itemObject; 
            const value = values[0];
            if (value.indexOf('*')> -1){
                defaultKey = value.replace('* ', '');
                itemObject = {label: defaultKey, description: "Current default"};
            } else {
                itemObject = {label: value};
            }  
            dataArray.push(itemObject);
        }
        return [dataArray, defaultKey];
    }
}

//adds precreated azure key to notation
async function addNewKey() { 

    const prompt: boolean = vscode.workspace.getConfiguration("securesupplychain").get('promptForKeyVersion', false);

    const keyName = await vscode.window.showInputBox({prompt: "Input the cert name"});
        //If the user escapes or enters an empty string in the inputbox, then exit the function
        if(keyName === undefined || keyName === ''){
            return;
        }

    if(prompt){
        const keyID = await vscode.window.showInputBox({prompt: "Input the Azure Key ID"});
        if (keyID === undefined ||  keyID === '') {
            return; 
        }

        const progressOptions: vscode.ProgressOptions = {
            location: vscode.ProgressLocation.Notification,
            title: vscode.l10n.t("Adding key..."),
        };
        await vscode.window.withProgress(progressOptions, async () => {
                const output = await execAsync(`${cliName} key add --plugin azure-kv --id ${keyID} ${keyName}`);
                if(output.stdout){
                    vscode.window.showInformationMessage("Key added");
                }else{ 
                    vscode.window.showErrorMessage(output.stderr);
                }            
        });  

    }else{

        const akvName = await vscode.window.showInputBox({prompt: "Input the azure key vault name"});
        if (akvName === undefined ||  akvName === '') {
            return; 
        }

        const progressOptions: vscode.ProgressOptions = {
            location: vscode.ProgressLocation.Notification,
            title: vscode.l10n.t("Adding key..."),
        };
        await vscode.window.withProgress(progressOptions, async () => {
            const cliKeyID = await execAsync(`az keyvault certificate show -n ${keyName} --vault-name ${akvName} --query "kid" -o tsv`);
            if(cliKeyID.stdout){
                const output = await execAsync(`${cliName} key add --plugin azure-kv --id ${cliKeyID.stdout} ${keyName}`);
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
    await loginToDockerCli(imageTag.parent);
    const notationCli = await checkCli(cliName);
    if (notationCli){
        const keyList = await execAsync(`${cliName} key list`);
        //Note that 'notation key list' does not usually error out and will always return an output string.
        if (keyList.stderr){
            vscode.window.showErrorMessage(keyList.stderr);
        } else {
            const [keyArray] = await sortOutput(keyList.stdout);
            const pick = await vscode.window.showQuickPick( [{label: "Add new key from Azure Key Vault"}, ...keyArray], {
                ignoreFocusOut : true,
                placeHolder : "Select a key to set as default.",
            });
            if (pick === undefined){ //user escapes the selection
                return;
            }else if(pick.label.indexOf('Add new') > -1){ //if user picks to add a new key
                await addNewKey();
            }else if (pick) {
                const progressOptions: vscode.ProgressOptions = {
                    location: vscode.ProgressLocation.Notification,
                    title: vscode.l10n.t(`Setting ${pick.label} as default key...`),
                };
                await vscode.window.withProgress(progressOptions, async () => {
                    const selectedItem = pick.label;
                    const setSuccess = await execAsync(`${cliName} key set --default "${selectedItem}"`);
                    if(setSuccess.stdout){
                        vscode.window.showInformationMessage(`${selectedItem} is now default key`);
                    }else{
                        vscode.window.showErrorMessage(setSuccess.stderr);
                    }
                });
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
