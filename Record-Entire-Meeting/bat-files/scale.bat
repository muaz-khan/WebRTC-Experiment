@echo off
"C:\ffmpeg\bin\ffmpeg.exe" -y -i %1 -vf scale=640x360,setdar=16:9:max=1000 %2