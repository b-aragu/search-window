import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FiMic, FiMicOff } from 'react-icons/fi'; // For microphone icons

const Modal = ({ isOpen, closeModal, title, content }) => {
  const [isReading, setIsReading] = useState(false);
  const speechSynthesis = window.speechSynthesis;

  // Function to handle starting/stopping the reading
  const toggleSpeech = () => {
    if (isReading) {
      speechSynthesis.cancel(); // Stop reading
      setIsReading(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(`${title}. ${content}`);
      utterance.lang = 'en-US'; // Set the language to English
      utterance.volume = 1; // Set volume
      utterance.rate = 1; // Set normal speed
      utterance.pitch = 1; // Set normal pitch
      
      // Ensure the full content is read
      speechSynthesis.speak(utterance); // Start reading
      setIsReading(true);

      // Reset the reading state when finished
      utterance.onend = () => {
        setIsReading(false);
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error);
        setIsReading(false);
      };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50 overflow-y-auto transition-opacity duration-300 ease-out">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-2xl transform transition-transform duration-300 ease-out scale-100 sm:scale-95 relative max-h-screen overflow-y-auto">
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute top-0 right-0 mt-4 mr-4 text-gray-400 hover:text-gray-700 transition-colors duration-200 ease-in-out"
        >
          &#10005;
        </button>
        
        {/* Modal Content */}
        <div className="text-lg">
          <h2 className="text-indigo-800 text-3xl font-extrabold mb-4 border-b pb-2">{title}</h2>
          <div className="text-gray-700 prose prose-indigo">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>

        {/* Microphone button to toggle reading */}
        <button
          onClick={toggleSpeech}
          className="absolute bottom-4 right-4 p-2 bg-indigo-500 text-white rounded-full shadow-md hover:bg-indigo-700 transition"
          aria-label="Toggle speech"
        >
          {isReading ? <FiMicOff className="h-6 w-6" /> : <FiMic className="h-6 w-6" />} {/* Initial state shows FiMicOff */}
        </button>
      </div>
    </div>
  );
};

export default Modal;
