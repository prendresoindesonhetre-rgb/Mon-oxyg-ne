from pathlib import Path
from array import array
import math
import shutil
import subprocess
import tempfile
import wave

ROOT = Path(__file__).resolve().parents[1]
RAIN = ROOT / "pwa" / "www" / "assets" / "rainstick"

FILTER = (
    "highpass=f=80,"
    "lowpass=f=6000,"
    "equalizer=f=2600:t=q:w=0.9:g=-9,"
    "equalizer=f=3900:t=q:w=1.1:g=-6,"
    "equalizer=f=700:t=q:w=1.0:g=4,"
    "equalizer=f=1250:t=q:w=1.0:g=2,"
    "volume=13dB"
)

TARGET_SECONDS = 8.0
SAMPLE_RATE = 44100
CROSSFADE_SECONDS = 0.70
FADE_IN_SECONDS = 0.80
FADE_OUT_SECONDS = 0.85
TARGET_PEAK_DB = -10.0


def run(cmd):
    subprocess.run(cmd, check=True)


def decode_and_warm(src: Path, wav_out: Path):
    run([
        "ffmpeg", "-y", "-v", "warning", "-err_detect", "ignore_err",
        "-i", str(src),
        "-af", FILTER,
        "-ar", str(SAMPLE_RATE), "-ac", "1",
        "-c:a", "pcm_s16le", str(wav_out),
    ])


def read_mono16(path: Path):
    with wave.open(str(path), "rb") as w:
        if w.getnchannels() != 1 or w.getsampwidth() != 2:
            raise RuntimeError(f"Format WAV inattendu: {path}")
        rate = w.getframerate()
        samples = array("h")
        samples.frombytes(w.readframes(w.getnframes()))
    return rate, samples


def write_mono16(path: Path, rate: int, samples):
    out = array("h", (max(-32768, min(32767, int(v))) for v in samples))
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(out.tobytes())


def loop_with_crossfade(samples, rate):
    src = list(samples)
    target = int(rate * TARGET_SECONDS)
    fade = max(1, int(rate * CROSSFADE_SECONDS))
    if len(src) <= fade + 10:
        raise RuntimeError("Enregistrement de bâton de pluie trop court.")

    out = src[:]
    while len(out) < target:
        overlap = min(fade, len(out), len(src))
        start = len(out) - overlap
        mixed = []
        for i in range(overlap):
            t = i / max(1, overlap - 1)
            # Fondu à puissance quasi constante, beaucoup plus doux qu'une coupure.
            a = math.cos(t * math.pi / 2.0)
            b = math.sin(t * math.pi / 2.0)
            mixed.append(out[start + i] * a + src[i] * b)
        out = out[:start] + mixed + src[overlap:]

    out = out[:target]

    fade_in = min(len(out), int(rate * FADE_IN_SECONDS))
    for i in range(fade_in):
        t = i / max(1, fade_in - 1)
        out[i] *= math.sin(t * math.pi / 2.0) ** 2

    fade_out = min(len(out), int(rate * FADE_OUT_SECONDS))
    for i in range(fade_out):
        t = i / max(1, fade_out - 1)
        out[len(out) - fade_out + i] *= math.cos(t * math.pi / 2.0) ** 2

    peak = max(abs(v) for v in out) or 1.0
    target_peak = 32767.0 * (10.0 ** (TARGET_PEAK_DB / 20.0))
    gain = target_peak / peak
    # On remonte le corps du son, sans compresser agressivement les grains.
    out = [v * gain for v in out]
    return out


def process_one(name: str):
    src = RAIN / f"{name}-8.mp3"
    if not src.exists():
        raise FileNotFoundError(src)

    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        decoded = td / f"{name}-warm.wav"
        extended = td / f"{name}-8-final.wav"
        encoded = td / f"{name}-8.mp3"

        decode_and_warm(src, decoded)
        rate, samples = read_mono16(decoded)
        softened = loop_with_crossfade(samples, rate)
        write_mono16(extended, rate, softened)

        run([
            "ffmpeg", "-y", "-v", "error",
            "-i", str(extended),
            "-codec:a", "libmp3lame", "-b:a", "96k",
            "-ar", str(SAMPLE_RATE), "-ac", "1",
            str(encoded),
        ])
        shutil.copyfile(encoded, src)

    print(f"{name}-8.mp3 : enregistrement personnel conservé, adouci et étendu à 8 s")


def main():
    for name in ("up", "down"):
        process_one(name)


if __name__ == "__main__":
    main()
