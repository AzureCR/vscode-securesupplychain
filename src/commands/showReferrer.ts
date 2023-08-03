import * as vscode from 'vscode';
import { execAsync } from '../support/execAsync';
import { window } from 'vscode';
import * as os from 'os';
import * as path from 'path';
import { access } from 'fs/promises'; //this import accepts one argument for calling access
/**
 * showReferrer checks the oras path to see if oras is downloaded and stored where we think it should be,
 * checks that an image tag has only the valid characters it needs, sends the oras discover command to be executed,
 * and has error handling
 * @param imageTag 
 */
export async function showReferrer(imageTag: any): Promise<void> {
    try {
        async function getOrasPath() {
            // check oras exist on user computer
            const isWindows = os.platform() === 'win32'; //identifying if its a windows platform using os.platform, if it is then isWindows will be true
            const homedir = os.homedir(); //getting the host computer home directory
            const orasExecutable = isWindows ? 'oras.exe' : 'oras'; //switches use of executable files. if true use oras.exe and if false use oras
            const dirOras = path.join(homedir, 'bin', 'oras', orasExecutable); //returns the path to oras

            try {
                await access(dirOras); // Check if the file exists, this will throw an error if the file doesn't exist
                return dirOras; // If the file exists, return the dirOras path
            } catch (err) {
                 // Throw an error with the message
                const errorMessage = 'ORAS not found on default path. Download ORAS or update path: ';
                const goToOrasLink = 'Download ORAS';
                const laterButton = 'Later';

                vscode.window.showInformationMessage(errorMessage, goToOrasLink, laterButton)
                    .then(selection => {
                        if (selection === goToOrasLink) {
                            vscode.env.openExternal(vscode.Uri.parse('https://oras.land/docs/installation'));
                            //TODO: include later button
                        } else if (selection === laterButton){
                           //when they choose later it closes the toast 
                        }
                    });

                throw new Error(errorMessage);
            }
        }
        const orasPath = await getOrasPath();

        const validTag = /^[a-z0-9./_:-]+$/; //Repository names can only include lowercase alphanumeric characters, periods, dashes, underscores, and forward slashes. But adding a Tag gives it a colon

        if(validTag.test(imageTag.fullTag)){
            const exportCommand = `"${orasPath}" discover -o tree "${imageTag.fullTag}"`; //
            const output = await execAsync(exportCommand)

            if(!output.stderr){
                vscode.workspace.openTextDocument({ content: output.stdout }).then(doc => {
                    // Show the newly created document in the editor
                    vscode.window.showTextDocument(doc);
                });
            } else {
                window.showErrorMessage("Test:" + output.stderr);
            }

            console.log(output.stdout)
            console.log(output.stderr)
        } else {
            window.showErrorMessage('Invalid Tag provided');
        }
        
    } catch (error) {
        window.showErrorMessage('Error'+ error);
        console.error('Error executing command:', error);
    }
}
