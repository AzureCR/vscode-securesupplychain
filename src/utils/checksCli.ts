import { execAsync } from './execAsync';

// checks that a specified CLI exists on a users computer through sending a 
//dummy command. The parameter is the initializer command of a cli (i.e. notation or oras).
// Based on the output we return a bool
export async function checkCli(cliName: string): Promise<boolean> {

    var result = await execAsync(`${cliName}`);
    if (result.stderr){
        return false;
    }else{
        return true ;
    }
}

