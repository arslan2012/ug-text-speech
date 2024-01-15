import torch
import librosa
from   sklearn import preprocessing


featurelen  = 128 #melspec, 60  #mfcc
sample_rate = 22050
fft_len     = 1024
hop_len     = 200


def melfuture(wav_path):
    audio, s_r = librosa.load(wav_path, sr=sample_rate, res_type='polyphase')

    audio = preprocessing.minmax_scale(audio, axis=0)
    audio = librosa.effects.preemphasis(audio)

    spec = librosa.feature.melspectrogram(y=audio, sr=s_r, n_fft=fft_len, hop_length=hop_len, n_mels=featurelen, fmax=8000)  
    spec = librosa.power_to_db(spec)
    #spec = librosa.amplitude_to_db(spec)

    spec = (spec - spec.mean()) / spec.std()
    spec = torch.FloatTensor(spec)

    return spec