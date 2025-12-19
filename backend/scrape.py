import requests
import re
import json
from dataclasses import dataclass
from typing import Optional
import urllib.request

@dataclass
class SunoSong:
    audio_url: Optional[str]
    description: Optional[str]
    tags: Optional[str]
    lyrics: Optional[str]

    def __str__(self):
        return (
            f"AUDIO: {self.audio_url}\n"
            f"DESC:  {self.description}\n"
            f"TAGS:  {self.tags}\n"
            f"{'-' * 20}\n"
            f"LYRICS:\n{self.lyrics}"
        )

def get_suno_song(url: str) -> Optional[SunoSong]:
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    html = requests.get(url, headers=headers).text

    pattern = r'self\.__next_f\.push\(\[1,"5:(.*?)"\]\)'
    match = re.search(pattern, html)

    if match:
        raw_json_string = match.group(1)
        clean_json_string = json.loads(f'"{raw_json_string}"')
        data_list = json.loads(clean_json_string)

        clip = None
        for item in data_list:
            if isinstance(item, dict) and 'clip' in item:
                clip = item['clip']
                break

        if clip:
            metadata = clip.get('metadata', {})
            return SunoSong(
                audio_url=clip.get('audio_url'),
                description=metadata.get('gpt_description_prompt'),
                tags=metadata.get('tags'),
                lyrics=metadata.get('prompt')
            )

    return None

def download_audio(song: SunoSong, filename="input.mp3"):
    if song and song.audio_url:
        print(f"Downloading {song.audio_url}...")
        urllib.request.urlretrieve(song.audio_url, filename)
        print(f"Saved to {filename}")
    else:
        print("No audio URL found.")
