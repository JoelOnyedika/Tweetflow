@echo off
echo Starting the Django server with SSL...
python manage.py runserver_plus --cert-file ..\certificates\localhost.pem --key-file ..\certificates\localhost-key.pem
echo Server stopped.
pause
