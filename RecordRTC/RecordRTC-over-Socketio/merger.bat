@echo off
"C:\ffmpeg\bin\ffmpeg.exe" -i %1 -i %2  %3 1> ffmpeg-output/%4.txt 2>&1