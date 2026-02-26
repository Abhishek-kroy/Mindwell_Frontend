import { useState, useRef } from 'react';
import { Send, Mic, MicOff, Loader2, MessageSquare } from 'lucide-react';

const ChatInput = ({ onSendMessage, disabled, darkMode }) => {
  const [input, setInput] = useState('');
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [sending, setSending] = useState(false);
  const textareaRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() && !disabled && !sending) {
      setSending(true);
      try {
        await onSendMessage(input.trim());
        setInput('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
      } finally {
        setSending(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const stopRecording = async () => {
    setRecording(false);
    mediaRecorderRef.current?.stop();
  };

  const handleVoiceToggle = async () => {
    if (recording) {
      stopRecording();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        setTranscribing(true);
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

        try {
          const hfToken = import.meta.env.VITE_HF_TOKEN;

          if (!hfToken) {
            alert('Missing HuggingFace token in environment.');
            console.error('🔑 VITE_HF_TOKEN not found in env');
            setTranscribing(false);
            return;
          }

          const response = await fetch(
            'https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${hfToken}`,
                'Content-Type': 'audio/webm',
              },
              body: audioBlob,
            }
          );

          const rawText = await response.text();

          if (!response.ok) {
            console.error('❌ Whisper API Error:', rawText);
            alert('Transcription failed. Try again later.');
            setTranscribing(false);
            return;
          }

          let result;
          try {
            result = JSON.parse(rawText);
          } catch (err) {
            console.error('❌ Failed to parse Whisper response:', rawText);
            alert('Invalid transcription response.');
            setTranscribing(false);
            return;
          }

          if (!result.text) {
            console.warn('⚠️ No speech detected.');
            alert('No speech detected in the audio.');
            setTranscribing(false);
            return;
          }

          console.log('✅ Transcribed text:', result.text);
          setInput(result.text.trim());
          setTranscribing(false);

          // Auto-focus the textarea after transcription
          if (textareaRef.current) {
            textareaRef.current.focus();
          }
        } catch (err) {
          console.error('❌ Audio processing failed:', err);
          alert('Audio processing error.');
          setTranscribing(false);
        }
      };

      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error('❌ Microphone access error:', err);
      alert('Please allow microphone access.');
    }
  };

  const isInputDisabled = disabled || sending || transcribing;
  const isButtonDisabled = disabled || sending || recording || transcribing;

  return (
    <>
      {/* Recording Modal */}
      {recording && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center backdrop-blur-sm">
          <div
            className={`p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 animate-fade-in max-w-sm mx-4
              ${darkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-black border border-gray-200'}`}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <Mic className="text-red-500 animate-pulse" size={40} />
                <div className="absolute -inset-2 rounded-full border-2 border-red-500 animate-ping opacity-30"></div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold">Recording...</h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Speak clearly into your microphone
                </p>
              </div>
            </div>
            <button
              onClick={stopRecording}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Stop Recording
            </button>
          </div>
        </div>
      )}

      {/* Transcribing Modal */}
      {transcribing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center backdrop-blur-sm">
          <div
            className={`p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 animate-fade-in max-w-sm mx-4
              ${darkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-black border border-gray-200'}`}
          >
            <div className="flex items-center gap-4">
              <Loader2 className="text-blue-500 animate-spin" size={40} />
              <div className="text-center">
                <h3 className="text-xl font-semibold">Transcribing...</h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Converting your speech to text
                </p>
              </div>
            </div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      {(sending || transcribing) && (
        <div className={`mb-3 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2
          ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-[#F9FBFF] text-[#7C9885] border border-[#7C9885]/10'}`}>
          {transcribing && (
            <>
              <Loader2 size={14} className="animate-spin text-[#7C9885]" />
              <span>Transcribing audio...</span>
            </>
          )}
        </div>
      )}

      {/* Chat Input */}
      <div className="flex items-end space-x-3 w-full bg-transparent p-2">
        <div className="flex-1 relative group">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={
              transcribing ? "Transcribing your voice..." :
                recording ? "Recording in progress..." :
                  sending ? "Sending..." :
                    "Type your message or use voice input..."
            }
            disabled={isInputDisabled}
            className={`w-full px-6 py-4 rounded-3xl focus:ring-4 focus:ring-[#7C9885]/10 focus:border-[#7C9885]/30 resize-y min-h-[56px] max-h-[200px] transition-all duration-300 text-[15px] shadow-sm
              ${isInputDisabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${darkMode
                ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-2 border-transparent hover:border-[#7C9885]/10 text-[#2D3142] placeholder-[#4A4E69]/40'
              }`}
            rows={1}
            style={{ scrollbarWidth: 'none' }}
          />
          {transcribing && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Loader2 size={18} className="animate-spin text-[#7C9885]" />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleVoiceToggle}
          disabled={isButtonDisabled}
          className={`p-4 rounded-full transition-all duration-300 relative shrink-0
            ${recording
              ? 'bg-red-50 text-red-500 shadow-xl border border-red-500/20 scale-110'
              : isButtonDisabled
                ? 'opacity-50 cursor-not-allowed'
                : darkMode
                  ? 'bg-gray-600 hover:bg-gray-500 text-white shadow-lg'
                  : 'bg-[#F9FBFF] hover:bg-[#7C9885]/10 text-[#7C9885] border border-[#7C9885]/20 hover:border-[#7C9885]/40 shadow-sm hover:shadow-md'
            }`}
        >
          {recording ? (
            <>
              <MicOff size={22} className="animate-pulse" />
              <div className="absolute -inset-1 rounded-full border border-red-300 animate-ping opacity-50"></div>
            </>
          ) : (
            <Mic size={22} />
          )}
        </button>

        <button
          type="submit"
          disabled={!input.trim() || isButtonDisabled}
          onClick={() => {
            if (!input.trim() || isButtonDisabled || sending) return;

            handleSubmit(new Event('submit'));
          }}
          className={`p-4 rounded-full transition-all duration-300 relative shrink-0 flex items-center justify-center
            ${sending
              ? 'bg-[#2D3142]/80 text-white cursor-not-allowed'
              : !input.trim() || isButtonDisabled
                ? 'opacity-50 cursor-not-allowed bg-[#2D3142]/50 text-white/50'
                : 'hover:shadow-xl hover:-translate-y-0.5'
            }
            ${darkMode ? 'bg-blue-600 text-white' : 'bg-[#2D3142] text-white'}`}
        >
          {sending ? (
            <Loader2 size={22} className="animate-spin" />
          ) : (
            <Send size={22} className="ml-0.5" />
          )}
        </button>
      </div>
    </>
  );
};

export default ChatInput;