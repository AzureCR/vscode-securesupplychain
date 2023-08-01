import { ShellQuotedString, ShellQuoting } from 'vscode';
import { CommandLineArgs } from './commandLineBuilder';

export interface IShell {
    quote(args: CommandLineArgs): Array<string>;
    goTemplateQuotedString(arg: string, quoting: ShellQuoting): ShellQuotedString;
    getShellOrDefault(shell?: string | boolean): string | boolean | undefined;
}
