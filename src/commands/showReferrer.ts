import { TaskCommandRunnerFactory } from '../support/TaskCommandRunnerFactory';
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

    function getOrasPath() {
        // check oras exist

        const isWindows = os.platform() === 'win32'; //identifying if its a windows platform using process.plateform from Node.js, if it is then isWindows will be true
        const homedir = os.homedir(); //getting the host computer home directory
        const orasExecutable = isWindows ? 'oras.exe' : 'oras'; //switches use of executable files. if true use oras.exe and if false use oras
        const dirOras = path.join(homedir, 'bin', 'oras', orasExecutable); //returns the path to oras

        try {
            access(dirOras); // Check if the file exists, this will throw an error if the file doesn't exist
            return dirOras; // If the file exists, return the dirOras path
          } catch (err) {
            console.log('no oras file found');
            return ' '; // If the file doesn't exist, return a empty string
          }
    }
        const orasPath = getOrasPath();

       const validTag = /^[a-z0-9./_:-]+$/; //Repository names can only include lowercase alphanumeric characters, periods, dashes, underscores, and forward slashes. But adding a Tag gives it a colon
       if(validTag.test(imageTag.fullTag)){
        await taskCRF.getCommandRunner()({
            command: orasPath,            //'C:\\Users\\t-annacardon\\bin\\oras\\oras.exe', //TODO: eventually fix, but currently has the path to my local oras
            args : ['discover', imageTag.fullTag]
        });
       }
       else{
        console.log("invalid tag");
       }
    } catch (error) {
        console.error('Error executing command:', error);
    }
}