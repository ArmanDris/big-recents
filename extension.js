const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const os = require('os');

function getHtmlContent(context) {
	const indexPath = path.join(context.extensionPath, 'src', 'index.html');
	return fs.readFileSync(indexPath, 'utf8');
}

function expandHomeDir(unexpanded_path) {
	if (unexpanded_path.startsWith('~')) {
		// Replace '~' with the full path to the user's home directory
		return path.join(os.homedir(), unexpanded_path.slice(1));
	}

	return unexpanded_path;
}

function openWorkspaceFunction(unexpanded_path) {
	const path = expandHomeDir(unexpanded_path);
	const workspaceUri = vscode.Uri.file(path);
	vscode.commands.executeCommand('vscode.openFolder', workspaceUri);
}

function showWelcomePage(context) {
	const panel = vscode.window.createWebviewPanel(
		'homePage',
		'Big Welcome',
		vscode.ViewColumn.One,
		{
			enableScripts: true
		}
	);

	const iconPath = vscode.Uri.file(path.join(context.extensionPath, 'src', 'sun.png'));
	panel.iconPath = iconPath;

	panel.webview.onDidReceiveMessage(
		message => {
			switch (message.command) {
				case 'openWorkspace': openWorkspaceFunction(message.unexpanded_path); break;
			}
		},
		undefined,
		context.subscriptions
	);

	panel.webview.html = getHtmlContent(context);

	sendWorkspacesToIndex(context, panel);
}

function saveWorkspace(context) {
	const homeDirectory = os.homedir();
	const workspace = vscode.workspace.workspaceFolders?.map(folder => folder.uri.fsPath.replace(homeDirectory, '~'));

	if (!workspace || workspace.length === 0)
		return;

	const first_folder = workspace[0];
	const old_workspace = context.globalState.get('workspace', []);

	if (old_workspace.includes(first_folder))
		return;

	const updated_workspace = [...old_workspace, first_folder]

	context.globalState.update('workspace', updated_workspace);

	console.log(context.globalState.get('workspace'));
}

function sendWorkspacesToIndex(context, panel) {
	const workspaces = context.globalState.get('workspace', []);
	panel.webview.postMessage({ command: 'sendWorkspaces', data: workspaces });
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	saveWorkspace(context);

	let commandShowWelcome = vscode.commands.registerCommand('big-welcome.Big-Welcome', function () {
		showWelcomePage(context);
	});
	context.subscriptions.push(commandShowWelcome);

	const hasOpenWorkspace = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0;

	if (hasOpenWorkspace)
		return;

	showWelcomePage(context);
}

// Deconstructor
function deactivate() { }

module.exports = {
	activate,
	deactivate
}