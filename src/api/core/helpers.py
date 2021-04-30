import hashlib
from pydub import AudioSegment
from os import path

def wav_to_s3files(upload_path: str, file_id: str, output_path = "/tmp"):
    s = AudioSegment.from_wav(upload_path).set_channels(1).set_frame_rate(16000)
    
    wav_path, mp3_path = [ path.join(output_path, file_id + ext) for ext in ["wav", "mp3"] ]

    s.export(wav_path, format="wav")
    s.export(mp3_path, format="mp3")

    return [wav_path, mp3_path]

# From https://stackoverflow.com/a/1131255/1703240
def generate_file_md5(filepath: str, blocksize: int=2**20):
    m = hashlib.md5()
    with open(filepath, "rb" ) as f:
        while True:
            buf = f.read(blocksize)
            if not buf:
                break
            m.update(buf)
    return m.hexdigest()

