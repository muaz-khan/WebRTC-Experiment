@echo off
"C:\ffmpeg\bin\ffmpeg.exe" -y -f concat -i %1 -c copy %2