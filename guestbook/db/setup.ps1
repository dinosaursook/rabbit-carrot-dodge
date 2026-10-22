# PostgreSQL에 guestbook 사용자·DB를 만들고 schema.sql을 적용한다. 여러 번 실행해도 안전하다.
# 필요한 값: db/.env.local 의 PGADMIN_PASSWORD, backend/.env.local 의 DATABASE_URL
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

function Read-EnvValue($file, $key) {
    $line = Get-Content $file | Where-Object { $_ -like "$key=*" } | Select-Object -First 1
    if (-not $line) { throw "$file 에 $key 가 없습니다." }
    return ($line -split '=', 2)[1]
}

$psql = Get-ChildItem 'C:\Program Files\PostgreSQL\*\bin\psql.exe' | Sort-Object FullName -Descending | Select-Object -First 1
if (-not $psql) { throw 'psql.exe를 찾지 못했습니다. PostgreSQL이 설치됐는지 확인하세요.' }

$url = [Uri](Read-EnvValue "$root\backend\.env.local" 'DATABASE_URL')
$appUser, $appPassword = $url.UserInfo -split ':', 2
$database = $url.AbsolutePath.TrimStart('/')

# psql 변수(:'user')는 -c에서는 풀리지 않아서 SQL을 표준 입력으로 보낸다.
function Invoke-Psql($user, $db, $sql, [string[]]$vars = @()) {
    $sql | & $psql.FullName -h $url.Host -p $url.Port -U $user -d $db -v ON_ERROR_STOP=1 -q @vars -f -
    if ($LASTEXITCODE -ne 0) { throw "psql 실행 실패 (사용자 $user, DB $db)" }
}

$env:PGPASSWORD = Read-EnvValue "$PSScriptRoot\.env.local" 'PGADMIN_PASSWORD'
Invoke-Psql 'postgres' 'postgres' @"
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'user', :'pass')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'user') \gexec
SELECT format('ALTER ROLE %I PASSWORD %L', :'user', :'pass') \gexec
SELECT format('CREATE DATABASE %I OWNER %I', :'db', :'user')
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'db') \gexec
"@ @('-v', "user=$appUser", '-v', "pass=$appPassword", '-v', "db=$database")

$env:PGPASSWORD = $appPassword
Invoke-Psql $appUser $database (Get-Content -Raw "$PSScriptRoot\schema.sql")
Remove-Item Env:PGPASSWORD
Write-Host "준비 완료: $database (사용자 $appUser, $($url.Host):$($url.Port))"
