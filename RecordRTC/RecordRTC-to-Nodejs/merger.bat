@echo off
"C:\ffmpeg\bin\ffmpeg.exe" -i %1 -itsoffset -00:00:01 -i %2 %3