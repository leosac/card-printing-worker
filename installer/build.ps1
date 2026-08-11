$ErrorActionPreference = "Stop"

# clean
@(
    'output'
    'directory.wxs'
) |
Where-Object { Test-Path $_ } |
ForEach-Object { Remove-Item $_ -Recurse -Force -ErrorAction Stop }

# create output dir
mkdir output

# get source dir
$source_dir = "..\"

# get package version number
$pkgversion = (Get-Content "$source_dir\package.json" | ConvertFrom-Json).version

$full_path = get-location

# this is your upgrade code and you should keep it for all builds
$guid = New-Guid

if([System.IO.File]::Exists("$full_path\guid.txt")) {
  $guid = Get-Content guid.txt -First 1
}
else {
  Add-Content guid.txt $guid
}

# generate the installer
$wix_dir="C:\Program Files\WiX Toolset v6.0\bin"

. "$wix_dir\x64\heat.exe" dir $source_dir -srd -dr INSTALLDIR -cg MainComponentGroup -out directory.wxs -ke -sfrag -gg -var var.SourceDir -sreg -scom -t exclude_files.xslt
. "$wix_dir\wix.exe" build -d SourceDir="$source_dir" -ext WixToolset.Util.wixext -ext WixToolset.UI.wixext -d PKGVERSION_NUMBER="$pkgversion" -d GUID="$guid" -loc en-us.wxl -o output\installer.msi *.wxs

# optional digital sign the certificate. 
# you have to previously import it.
#. "C:\Program Files (x86)\Microsoft SDKs\Windows\v7.1A\Bin\signtool.exe" sign /n "Auth10" .\output\installer.msi