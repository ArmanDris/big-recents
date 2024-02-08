// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

function getHtmlContent(context) {
	const indexPath = path.join(context.extensionPath, 'src', 'index.html');
	return fs.readFileSync(indexPath, 'utf8');
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

	panel.webview.html = getHtmlContent(context);
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	showWelcomePage(context);
	console.log('My extension is now active!');
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('big-welcome.Big-Welcome', function () {
		// The code you place here will be executed every time your command is executed
		showWelcomePage(context);
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}