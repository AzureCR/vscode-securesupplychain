import * as vscode from 'vscode';
import { logInToDockerCli } from '../registries/logInToDockerCli';
import { checkCLI } from '../../utils/checkCLI';
import { execAsync } from '../../utils/execAsync';
import { stderr } from 'process';
import { exec } from 'child_process';

const cliName = 'notation';
const goToNotaryButton = 'Download Notary';
const orasURL = 'https://notaryproject.dev/docs/installation/cli/';
const errorMessage = `Notary not found: `;

async function sortOutput(theArray: any ){
    //const headers = theArray[0].trim().split( / {3,} /); //get headers and split if spaces are more than three
    const dataArray = new Array(); //: Array<{ [key: string]: string }> = []; //create an array
    const experimentArray = [{label: "Add new key."}];
    for (let i = 1; i < theArray.length; i++) { //go through the length of the array with values
      const values = theArray[i].trim().split(/ {2,} /); //get the values and trimming black spaces
      var itemObject; //: { [key: string]: string } = {};
      for (let j = 0; j < 1; j++) { //loop through the strings based on the number of headers
        //var itemName = headers[j];
        const value = values[j];
        if (value.indexOf('*')> -1){
            const keyWithoutAsterisk = value.replace('* ', '');
            itemObject = {label: keyWithoutAsterisk, description: "DEFAULT"};//itemObject[itemName] = value;
        } else {
            itemObject = {label: value};//itemObject[itemName] = value;
        }
      }
      
      dataArray.push(itemObject);
    }
    return dataArray;
}

async function addNewKey() { //TODO: Error handling
    const Key_Name = await vscode.window.showInputBox({prompt: "Input the key name"});
    const AKV_NAME = await vscode.window.showInputBox({prompt: "Input the key vault name"});
    //await execAsync("az login");
    const Key_ID = await execAsync(`az keyvault certificate show -n ${Key_Name} --vault-name ${AKV_NAME} --query "kid" -o tsv`);
    var output = await execAsync(`notation key add --plugin azure-kv --id ${Key_ID.stdout} ${Key_Name}`);
    if(output.stdout){
        vscode.window.showInformationMessage("Key added")
    }else{ 
        vscode.window.showErrorMessage(output.stderr)
    }
}

export async function selectSigning(imageTag: any): Promise<void> {
    await logInToDockerCli(imageTag.parent);
    var notaryCli = await checkCLI(cliName);
    if (notaryCli){
        console.time('key list');
        var experiment = await execAsync("notation key list");
        console.timeEnd('key list');
        //var output = await execAsync(`${cliName} sign ${imageTag.fullTag}`);
        if (experiment.stdout){
            var keyArray = experiment.stdout.split("\n");
            var keyChoices = await sortOutput(keyArray);
            const pick = await vscode.window.showQuickPick( [{label: "Add new Azure key"}, ...keyChoices], {
                ignoreFocusOut :false,
                canPickMany: false,
                placeHolder : "Select a key to set as default."
            })
            if(pick.label.indexOf('Add new') > -1){
                await addNewKey();
            }else if (pick) {
                const progressOptions: vscode.ProgressOptions = {
                    location: vscode.ProgressLocation.Notification,
                    title: vscode.l10n.t('Setting key as default...'),
                };
                console.time('signing list');
                await vscode.window.withProgress(progressOptions, async () => {
                    const selectedItem = pick.label;
                    var errOut = await execAsync(`notation key set --default "${selectedItem}"`);
                    if(errOut.stdout){
                        vscode.window.showInformationMessage(`${selectedItem} now default key`);
                    }else{
                        vscode.window.showErrorMessage(errOut.stderr);
                    }
                });
                console.timeEnd('signing list');
            }else {
                vscode.window.showInformationMessage("no key selected");
            }
        }
    }else {
        vscode.window.showErrorMessage(errorMessage, goToNotaryButton)
            .then(selection => {
                if (selection === goToNotaryButton) {
                    vscode.env.openExternal(vscode.Uri.parse(orasURL));
                } 
            });
    }

}
