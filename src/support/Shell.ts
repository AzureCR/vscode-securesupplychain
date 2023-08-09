/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
//https://github.com/microsoft/vscode-docker-extensibility/blob/main/packages/vscode-container-client/src/contracts/Shell.ts
import { ShellQuotedString, ShellQuoting } from 'vscode';
import { CommandLineArgs } from '@microsoft/vscode-container-client';

export interface IShell {
    quote(args: CommandLineArgs): Array<string>;
    goTemplateQuotedString(arg: string, quoting: ShellQuoting): ShellQuotedString;
    getShellOrDefault(shell?: string | boolean): string | boolean | undefined;
}