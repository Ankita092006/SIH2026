import gradio as gr
import spaces
from asr import transcribe_audio


@spaces.GPU
def transcribe(audio):
    if audio is None:
        return ""

    return transcribe_audio(audio)


demo = gr.Interface(
    fn=transcribe,
    inputs=gr.Audio(type="filepath"),
    outputs=gr.Textbox(label="Transcription"),
    title="SIH26003 Voice Assistant",
    description="Speech-to-text using SraVaani"
)

demo.launch()