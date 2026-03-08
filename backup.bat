@echo off
podman exec tracker-postgres pg_dump -U vs-map-tracker vs-map-tracker > ./backup.sql
echo Database dumped to backup.sql
pause