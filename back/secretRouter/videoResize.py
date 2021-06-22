import moviepy.editor as mp
import sys, getopt

# Python script used in order to resize video files which are uploaded to server
#
#
import os 
dir_path = os.path.dirname(os.path.realpath(__file__))

tmpdir = ""
finaldir = ""

#print("**********************************")
#print("*       Python Video Resize      *")
#print("*                                *")
#print("*                                *")
#print("*                                *")
#print("**********************************")

inputfile = ''
outputfile = ''

inName =""
outName=""
argv = sys.argv[1:]
inName = argv[0]
outName = argv[1]
resArg = argv[2]
res=0
if resArg == '360p':
    res=360
elif resArg == '720p':
    res=720
elif resArg == '1080p':
    res=1080



tempIn = os.getcwd()
tempOut = os.getcwd()

inputfile= tempIn + inName
outputfile= tempOut +outName

print ('Input file is ', inName)
print ('Output file is ', outName)
f = open("pythonLog.txt", "a")

clip = mp.VideoFileClip(inputfile)
clip_resized = clip.resize(height=res) # make the height 360px ( According to moviePy documenation The width is then computed so that the width/height ratio is conserved.)
clip_resized.write_videofile(outputfile)
print('Resized!')

