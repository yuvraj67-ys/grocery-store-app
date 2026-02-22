export const startVoiceSearch = (onResult, onError) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    onError("आपका फोन वॉइस सर्च सपोर्ट नहीं करता। (Voice search not supported)");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'hi-IN'; // Hindi India
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event) => {
    onError("आवाज़ साफ नहीं आई, कृपया फिर से बोलें।");
  };

  recognition.start();
};
