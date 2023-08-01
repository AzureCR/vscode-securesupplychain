import * as vscode from 'vscode';
import { execAsync } from '../support/execAsync';
import { window } from 'vscode';
import * as os from 'os';
import * as path from 'path';
import { access } from 'fs/promises'; //this import accepts one argument for calling access

export async function showReferrer(imageTag: any): Promise<void> {
    try {
        async function getOrasPath() {
            // check oras exist on user computer
            const isWindows = os.platform() === 'win32'; //identifying if its a windows platform using os.plateform, if it is then isWindows will be true
            const homedir = os.homedir(); //getting the host computer home directory
            const orasExecutable = isWindows ? 'oras.exe' : 'oras'; //switches use of executable files. if true use oras.exe and if false use oras
            const dirOras = path.join(homedir, 'bin', 'oras', orasExecutable); //returns the path to oras

            try {
                await access(dirOras); // Check if the file exists, this will throw an error if the file doesn't exist
                return dirOras; // If the file exists, return the dirOras path
            } catch (err) {
                throw new Error('ORAS executable not found.'); // Throw a custom error if ORAS executable doesn't exist
            }
        }
        const orasPath = await getOrasPath();

        const validTag = /^[a-z0-9./_:-]+$/; //Repository names can only include lowercase alphanumeric characters, periods, dashes, underscores, and forward slashes. But adding a Tag gives it a colon

        if(validTag.test(imageTag.fullTag)){
            const exportCommand = `"${orasPath}" discover -o tree "${imageTag.fullTag}"`;
            const output = await execAsync(exportCommand)

            if(!output.stderr){
                vscode.workspace.openTextDocument({ content: output.stdout }).then(doc => {
                    // Show the newly created document in the editor
                    vscode.window.showTextDocument(doc);
                });
            } else {
                window.showErrorMessage(output.stderr);
            }

            console.log(output.stdout)
            console.log(output.stderr)
        } else {
            window.showErrorMessage('Invalid Tag provided');
        }
        
    } catch (error) {
        window.showErrorMessage('An error occurred: ' + error);
        console.error('Error executing command:', error);
    }
}
