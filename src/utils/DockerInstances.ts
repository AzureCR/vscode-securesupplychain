/**  This interface declares that any object of type IRemoteTreeItem should have a 
 * fullTag property of type string and parent of type any. It defines the objects that 
 * are expected to be passed to the command async callback function.
 */  
export interface IDockerInstance {
	//the tag of an image thats passed to the oras command
	readonly fullTag: string;
	//the node of an image passed to get login credentials
	readonly parent: any;
}