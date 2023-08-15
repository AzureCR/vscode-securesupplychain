import * as vscode from 'vscode';
import { logInToDockerCli } from '../registries/logInToDockerCli';
import { checkCLI } from '../../utils/checkCLI';
import { execAsync } from '../../utils/execAsync';

const cliName = 'notation';
const goToNotaryButton = 'Download Notary';
const orasURL = 'https://notaryproject.dev/docs/installation/cli/';
const errorMessage = `Notary not found: `;

async function sortOutput(theArray : Array<any>){
    //const headers = theArray[0].trim().split( / {3,} /); //get headers and split if spaces are more than three
    const dataArray =[]; //: Array<{ [key: string]: string }> = []; //create an array

    for (let i = 1; i < theArray.length; i++) { //go through the length of the array with values
      const values = theArray[i].trim().split(/ {2,} /); //get the values and trimming black spaces
      var itemObject; //: { [key: string]: string } = {};
      for (let j = 0; j < 1; j++) { //loop through the strings based on the number of headers
        //var itemName = headers[j];
        const value = values[j];
        itemObject = value; //itemObject[itemName] = value;
      }
      
      dataArray.push(itemObject);
    }
    return dataArray;
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
            const pick = await vscode.window.showQuickPick(keyChoices, {
                ignoreFocusOut :false,
                canPickMany: false,
            })
            if (pick){
                const progressOptions: vscode.ProgressOptions = {
                    location: vscode.ProgressLocation.Notification,
                    title: vscode.l10n.t('Signing...'),
                };
                console.time('signing list');
                await vscode.window.withProgress(progressOptions, async () => {
                    const selectedItem = pick;
                    var errOut = await execAsync(`notation sign --key "${selectedItem}" ${imageTag.fullTag}`);
                    if(errOut.stdout){
                        vscode.window.showInformationMessage("image signed!!")
                    }else{
                        vscode.window.showErrorMessage(errOut.stderr)
                    }
                });
                console.timeEnd('signing list');
            }else {
                vscode.window.showInformationMessage("no option selected")
            }
        }else{

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
