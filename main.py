from scrape import *

song = get_suno_song("https://suno.com/song/27934a61-5d0b-48fc-a8b3-a3b3b2771c7a")

print(song)

download_audio(song, "song.mp3")