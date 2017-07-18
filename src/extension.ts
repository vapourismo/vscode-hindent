'use strict'

import * as vscode from 'vscode'
import * as cp from 'child_process'

class HIndentFormatter implements vscode.DocumentFormattingEditProvider {
	outChan: vscode.OutputChannel

	constructor(outChan: vscode.OutputChannel) {
		this.outChan = outChan
	}

	format(input: string): string {
		const proc = cp.spawnSync(
			'hindent',
			[],
			{
				cwd: vscode.workspace.rootPath,
				input
			}
		)

		if (proc.status !== 0)
			return null

		return proc.stdout.toString()
	}

	provideDocumentFormattingEdits(
		document: vscode.TextDocument,
		options: vscode.FormattingOptions,
		token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.TextEdit[]> {
		this.outChan.appendLine('Formatting ' + document.fileName)

		const result = this.format(document.getText())

		if (result == null)
			return null

		const startPos = new vscode.Position(0, 0)
		const endPos = document.lineAt(document.lineCount - 1).range.end

		return [vscode.TextEdit.replace(new vscode.Range(startPos, endPos), result)]
	}
}

export function activate(context: vscode.ExtensionContext) {
	const outChan = vscode.window.createOutputChannel('HIndent')
	outChan.appendLine('Activated')

	const hindent = new HIndentFormatter(outChan)

	vscode.languages.registerDocumentFormattingEditProvider('haskell', hindent)
}

export function deactivate() {}
