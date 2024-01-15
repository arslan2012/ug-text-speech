from glob import glob
import os
from urllib import request
from py7zr import SevenZipFile

from fastapi.responses import FileResponse
from transformers import VitsModel, AutoTokenizer
import torch
import scipy

from .UModel import UModel

MAX_FILES = 10
SOUND_FILES_DIR = "sound_files/"
WORKING_DIR = "api/UTTS/"

def Text2Speech(text = "ارسلان"):
    clean_sound_files()

    model = VitsModel.from_pretrained("facebook/mms-tts-uig-script_arabic")
    tokenizer = AutoTokenizer.from_pretrained("facebook/mms-tts-uig-script_arabic")
    
    inputs = tokenizer(text, return_tensors="pt")

    with torch.no_grad():
        output = model(**inputs).waveform

    output = output.squeeze().numpy()

    if not os.path.exists(SOUND_FILES_DIR):
        os.makedirs(SOUND_FILES_DIR)
    file_path = f"{SOUND_FILES_DIR}{text}.wav"
    scipy.io.wavfile.write(file_path, rate=model.config.sampling_rate, data=output)
    return FileResponse(file_path, media_type="audio/wav")

def Speech2Text(audiofile = "techno.wav"):
    if not os.path.exists(WORKING_DIR+'results'):
        download_model()
    model = UModel(WORKING_DIR+'results/UModel')
    device = 'cpu'
    model.to(device)
    txt = model.predict(audiofile,device)
    return txt

def clean_sound_files():
    existing_files = glob(SOUND_FILES_DIR + "*.wav")
    num_existing_files = len(existing_files)
    if num_existing_files >= MAX_FILES:
        existing_files.sort(key=os.path.getctime)
        num_files_to_delete = num_existing_files - MAX_FILES + 1
        for i in range(num_files_to_delete):
            os.remove(existing_files[i])

def download_model():
    url = 'https://github.com/gheyret/uyghur-asr-ctc/releases/download/data/results.7z'
    filehandle, _ = request.urlretrieve(url)
    archive = SevenZipFile(filehandle, mode='r')
    archive.extractall(path=WORKING_DIR)
    archive.close()
    return "Done"