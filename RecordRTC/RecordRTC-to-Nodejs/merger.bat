@echo off
"C:\ffmpeg\bin\ffmpeg.exe" -itsoffset -00:00:00 -i %1 -itsoffset -00:00:00 -i %2 %3