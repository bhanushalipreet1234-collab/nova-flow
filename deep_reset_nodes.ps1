cd "C:\Users\Preet Bhanushali\Desktop\nova-flow"

Write-Output "🚀 Starting deep reset of nodes and cleanup..."

# --- Backend cleanup ---
# Ensure backend/nodes is empty
if (Test-Path ".\backend\nodes") {
    Remove-Item -Path ".\backend\nodes\*" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Output "✅ backend/nodes cleared"
}

# Reset executor.py (clear NODE_REGISTRY)
$executorPath = ".\backend\executor.py"
if (Test-Path $executorPath) {
    (Get-Content $executorPath) -replace 'NODE_REGISTRY\s*=\s*\{[^\}]*\}', 'NODE_REGISTRY = {}' |
        Set-Content $executorPath
    Write-Output "✅ backend/executor.py NODE_REGISTRY reset"
}

# --- Frontend cleanup ---
# Remove node files in frontend/src/nodes
$frontendNodes = @(
    ".\frontend\src\nodes\AiNode.tsx",
    ".\frontend\src\nodes\HttpNode.tsx",
    ".\frontend\src\nodes\nodetype.ts"
)
foreach ($file in $frontendNodes) {
    if (Test-Path $file) {
        Remove-Item -Path $file -Force
        Write-Output "🗑️ Removed $file"
    }
}

# --- Cleanup all empty files in project ---
$emptyFiles = Get-ChildItem -Path . -Recurse -File | Where-Object { $_.Length -eq 0 }
foreach ($file in $emptyFiles) {
    Remove-Item $file.FullName -Force
    Write-Output "🗑️ Deleted empty file: $($file.FullName)"
}

Write-Output "✨ Deep reset complete: Nodes removed + empty files deleted."
