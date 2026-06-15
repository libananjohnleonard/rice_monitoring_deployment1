Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

projectPath = fso.GetParentFolderName(WScript.ScriptFullName)

command = "cmd /k cd /d """ & projectPath & """ && ""Run Rice Health Monitor.bat"""

shell.Run command, 1, False
WScript.Sleep 9000
shell.Run "http://localhost:5173", 1, False
