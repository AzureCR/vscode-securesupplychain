import { TaskCommandRunnerFactory } from '../support/TaskCommandRunnerFactory';
import { window } from 'vscode';
import * as os from 'os';
import * as path from 'path';
import { access } from 'fs/promises'; //this import accepts one argument for calling access

export async function showReferrer(imageTag: any): Promise<void> {
    try {
        const taskCRF = new TaskCommandRunnerFactory({
            taskName: 'oras', // Specify the task name here
            alwaysRunNew: true, // Optional: Specify whether to always run the command as a new task
            focus: true, // Optional: Specify whether to focus on the task's output panel in the UI, currently true for now and can change later
        });

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
            await taskCRF.getCommandRunner()({
                command: orasPath,            
                args : ['discover', imageTag.fullTag]
            });
       }
        else{
            window.showErrorMessage('Invalid Tag provided');
       }
    } catch (error) {
        window.showErrorMessage('An error occurred: ' + error);
        console.error('Error executing command:', error);
    }
}