import { l10n } from 'vscode';
import { TaskCommandRunnerFactory } from '../support/TaskCommandRunnerFactory';
import * as vscode from 'vscode';



//first try
export async function showReferrer(imageTag: any): Promise<void> {

    try {
        const taskCRF = new TaskCommandRunnerFactory({
            taskName: 'oras', // Specify the task name here
            alwaysRunNew: true, // Optional: Specify whether to always run the command as a new task
            focus: true, // Optional: Specify whether to focus on the task's output panel in the UI, currently true for now and can change later
        });

        // Construct argument based on the imagetag object
        const args = ['discover', imageTag.fullTag] || ['discover', '-h']; //will take the tag if present or go to -h

        await taskCRF.getCommandRunner()({
            command: 'C:\\Users\\t-annacardon\\bin\\oras\\oras.exe', //TODO: eventually fix, but currently has the path to my local oras
            args,
        });
    } catch (error) {
        console.error('Error executing command:', error);
    }
}