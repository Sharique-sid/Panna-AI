# PowerShell script to update the service role key
Write-Host "Current .env.local content:" -ForegroundColor Yellow
Get-Content .env.local

Write-Host "`nPlease enter your actual service role key from Supabase:" -ForegroundColor Green
$serviceRoleKey = Read-Host "Service Role Key"

if ($serviceRoleKey -and $serviceRoleKey -ne "your_supabase_service_role_key_here") {
    # Read the current file
    $content = Get-Content .env.local
    
    # Replace the service role key line
    $newContent = $content | ForEach-Object {
        if ($_ -match "^SUPABASE_SERVICE_ROLE_KEY=") {
            "SUPABASE_SERVICE_ROLE_KEY=$serviceRoleKey"
        } else {
            $_
        }
    }
    
    # Write back to file
    $newContent | Set-Content .env.local
    
    Write-Host "`nUpdated .env.local file!" -ForegroundColor Green
    Write-Host "New content:" -ForegroundColor Yellow
    Get-Content .env.local
} else {
    Write-Host "Invalid key or no key provided." -ForegroundColor Red
}
