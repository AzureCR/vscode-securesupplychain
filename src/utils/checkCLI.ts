import { execAsync } from './execAsync';

// checks that a specified CLI exists on user computer through sending a dummy command. Based on the output we return a bool
export async function checkCLI(cliName: string): Promise<boolean> {

    var result = await execAsync(`${cliName}`);
    if (result.stderr){
        return false;
    }else{
        return true ;
    }
}

