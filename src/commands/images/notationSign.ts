import { title } from 'process';
import * as vscode from 'vscode';
import { logInToDockerCli } from '../registries/logInToDockerCli';

export async function notationSign(imageTag: any): Promise<void> {
    await logInToDockerCli(imageTag.parent);
    const choices = [
        "first name",
        "last name",
        "full name"
    ]
    var selectedChoice = await vscode.window.showQuickPick(choices, {
        placeHolder : "Select an option"
    })

    var testing = await vscode.window.showInputBox ( 
        //prompt : choices,
    )
    if (testing === ''){
        vscode.window.showErrorMessage("Please put your name for the show!")
    } else {
        vscode.window.showInformationMessage( "Hello " + testing);
    }
    //look into
    vscode.window.visibleNotebookEditors
    vscode.window.visibleTextEditors
}

export async function buildSubMenu (imageTag: any) {
    const choices = [
        "first name",
        "last name",
        "full name"
    ]
}