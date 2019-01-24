@echo off

:: get the current directory
:: https://stackoverflow.com/a/25719250
set loc=%~dp0

:: get the parent of current directory
:: https://stackoverflow.com/a/26055466
for %%a in ("%~dp0..\") do set "par=%%~fa"



:: definitions of variables

:: the location of the MsBuild15 is very very hard to find, if you have a problem with finding msbuild15 on your machine see the following link
:: https://stackoverflow.com/a/47942899/4390133
set msDir="C:\Program Files (x86)\Microsoft Visual Studio\2017\Community\MSBuild\15.0\Bin"
set slnDir=%par%Swazer.ShoppingList.sln
set prfDir=%loc%Properties\PublishProfiles\CustomProfile.pubxml
set dllDir=C:\\inetpub\\wwwroot\\Appointment\\bin\\Swazer.ShoppingList.WebApp.dll
set gitDir="C:\inetpub\wwwroot\Appointment"

echo Press any key to pull the new version
pause >nul

cd %gitDir%
git pull

:: delete all directories, except .git
@echo off
for /f "tokens=*" %%A in ('dir /b /ad %gitDir%') do (
    if NOT "%%A"==".git" (
        RD /S /Q "%gitDir%\%%A"
    )
)
:: delete all files
for %%i in (%gitDir%\*) do (
	if NOT "%%~nxi"==".gitignore" (
		del "%%i"
	)
)

echo Press any key to build the new version 
pause >nul

:: https://stackoverflow.com/a/13947667
:: publish the project
cd %msDir%
msbuild %slnDir% /t:Rebuild /p:Configuration=Release /p:DeployOnBuild=true /p:ContinueOnError=false /p:PublishProfile=%prfDir%

:: https://stackoverflow.com/a/734634
:: stop the batch file if the publish did not success
if %errorlevel% neq 0 pause /b %errorlevel%

echo Press any key to push the new version 
pause >nul

:: https://stackoverflow.com/a/19830679
:: get the version of the dll
for /f "usebackq delims=" %%a in (`"WMIC DATAFILE WHERE name='%dllDir%' get Version /format:Textvaluelist"`) do (
    for /f "delims=" %%# in ("%%a") do set "%%#"
)
if "%~2" neq "" (
    endlocal & (
        echo %version%
        set %~2=%version%
    )
)

:: remove the last part of the version
for /F "tokens=1,2,3 delims=. " %%a in ("%version%") do (
   set version=%%a.%%b.%%c
)
echo %version%

:: all the git commands
cd %gitDir%
git add -A
git commit -m "- Version %version%"
git tag "v%version%"
git push
git push --tags

echo Press any key to exit
pause >nul