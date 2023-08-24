# vscode-securesupplychain
vscode extension for container related secure supply chain tools

## Current Docker Extension Capabilities with Registries
The VS-code-Docker extension uses the Docker V2 API to facilitate the distribution of images to the Docker engine. The extension interacts with instances of the Docker registry, which is a service to manage information about docker images and enable their distribution. The API is assigned/called in the [RegistryApi.ts](https://github.com/microsoft/vscode-docker/tree/main/src/tree/registries/all). The current extension displays the repositories to which the user has access to and the tags within them as a tree view in the Registries category.

![Alt text](<resources/readme/currentDocker.png>)

How the current extension shows the registries:
Located at [vscode-docker](https://github.com/microsoft/vscode-docker/tree/main/src/tree/registries).
-	Accessing Repositories as Tree View: The extension accesses Docker registries using the Docker V2 API. It allows users to view the repositories available to them in a convenient tree view format under the "Registries" group. This tree view presents a hierarchical structure of repositories and their corresponding image tags.
-   CLI Commands: The Docker extension offers various commands to manage Docker-related tasks. These commands are available in the extension's source code, commands recognized in the Registries group can be found [here](https://github.com/microsoft/vscode-docker/tree/main/src/commands/registries). These CLI commands allow users to perform operations such as pull image, delete image, pull repository, and delete registry right from within Visual Studio Code.

**Limitations:**
- No display of image referrers.
- No support for image signing.


## Adding New Capabilities to the Existing Docker VS Code Extension
The secondary extension introduces features enhancing user experience by providing image referrer information and enabling image signing. Referrer data is obtained using the ORAS CLI, and image signing leverages the Notation CLI.

### User Experience:
**Right-Click Interaction:**
1. Users navigate to "Registries" panel in Docker View of VS Code.
2. Right-click a tag image to access menu options, including new features.

![Alt text](<resources/readme/commandGuide.png>)

menu

![Alt text](<./resources/readme/newDockerMenu.png>)

Once an action is selected the user is logged into the docker cli and the command is then executed.

### Show Referrers

When right clicking on the tag image select 'Show Referrer' in the menus option. The command `oras discover -o tree $IMAGE` is then executed and the referrer output tree is put into a text document to be read by the user.

![Alt text](<./resources/readme/textDoc.png>)

### Signing a image steps
- Navigate to the menu option `Set the Default Signing Key…` to see the available keys for signing an image. The user interface appears as this:

![Alt text](<./resources/readme/setKeyDefault.png>)
- The current default is shown as a description next to the key name. To change the default select an available key and the command `notation key set --default $KEY` is executed and the default signing key is updated.
- There is also the option to `Add new key from Azure Key Vault`. When the user selects this they are taken through a dialog to input the new key name and the name of the AKV that they want to add. There is a setting option to instead input the key ID instead of the AKV name so that if the user wants a certain version of a key instead of the latest they have that option. The setting looks like this: 

![Alt text](<./resources/readme/keyVersionSetting.png>)

- Once the user has keys and a default key set up then they can sign an image using the `Sign Image` in the menu option.
#### To Do:
 - When an image has no referrers the tree only shows the root image. This is confusing to see as a user and needs to be fixed to instead tell the user no referrers were found for this image.
 - Referrence an image by it's digest instead of tag when executing cli commands.

### Setting up the feature:
- Prerequisites
    - Download ORAS Library
    - Download Azure CLI
    - Download Notation CLI
    - Install Docker extension and Docker Desktop
    - Add ORAS directory to PATH environment variable.

    

### Coding the features:
-   To implement the features, we replicated the current Docker [commands](https://github.com/microsoft/vscode-docker/tree/main/src/commands) structure for registry items. Following a clear pattern: defining the command seen in the menu, handling the event triggering, and executing the CLI command. Instead of relying on the Docker CLI, the features will leverage the ORAS CLI or the Notation CLI.
- We check that CLI's are downloaded through sending a dummy command. If the command errors we responsed with an error message stating the cli isn't downloaded or set up in the enviorment variables and provide a link to their installation page.
- For authentication the Docker extension's logInToDockerCli function was imported into the feature and we coded a replica of the getDockerCliCredentials function so that the login credentials are passed accordingly.

### Design:
- It will be implemented as a secondary extension dependant on the VScode Docker extension. 
- The secondary extension is available when when the user right clicks on an image.

## Known Issues

When a image has no referrers the displayed text doc can be initally confusing to look at.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

