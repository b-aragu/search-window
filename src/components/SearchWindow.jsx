import React, { useState, useEffect } from "react";
import sanityClient from "@sanity/client";
import searchIcon from '../assets/image.png';
import micIcon from '../assets/oral.png';
import Modal from './Modal'; 

// Initialize Sanity client
const client = sanityClient({
  projectId: "x98ssp32", 
  dataset: "production", 
  apiVersion: "2021-08-31",
  useCdn: true,
});

const SearchWindow = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState(""); 
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);

  // Speech recognition initialization
  const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new speechRecognition();

  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  const startListening = () => {
    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const spokenQuery = event.results[0][0].transcript;
      setQuery(spokenQuery);
      handleSearch(spokenQuery);
    };

    recognition.onspeechend = () => {
      setIsListening(false);
      recognition.stop();
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };
  };

  const handleSearch = async (searchQuery = query) => {
    if (searchQuery.trim() === "") {
      setError("Please enter a valid dental search term");
      return;
    }
    setError("");
    await fetchFromGroqBackend(searchQuery);
  };

  const fetchFromGroqBackend = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/groq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await response.json();
      const aiResult = {
        _id: "ai-response",
        title: searchQuery, 
        description: data.aiResponse || "No valid response from AI.",
      };

      setResults((prevResults) => [...prevResults, aiResult]);
      setError("");
    } catch (error) {
      console.error("Error fetching AI response from backend:", error);
      setError("Error fetching AI response, please try again later.");
    }
    setLoading(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const openModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent("");
    setModalTitle("");
  };

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <div className="relative w-full max-w-lg">
        <div className="flex items-center border border-indigo-500 rounded-lg shadow-md focus-within:ring-2 focus-within:ring-indigo-400 transition duration-300 ease-in-out bg-tranquil-mist">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-4 outline-none bg-transparent"
            placeholder="Search dental topics..."
            aria-label="Search for dental topics"
          />

          {loading && (
            <div className="flex items-center justify-center">
              <div className="mr-2 animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-royal-velvet text-white rounded-r-lg transition duration-300 transform active:scale-110"
            aria-label="Submit Search"
          >
            <img src={searchIcon} alt="Search Icon" className="h-12 w-12" />
          </button>

          {/* Microphone Button */}
          <button
            onClick={startListening}
            className="ml-2 p-2 transition duration-300 transform active:scale-110"
            aria-label="Voice Search"
          >
            <img src={micIcon} alt="Microphone Icon" className="h-12 w-12" />
          </button>
        </div>

        {results.length > 0 && (
          <ul className="max-h-80 overflow-y-auto absolute z-10 w-full mt-4 bg-crystal-snow border border-indigo-200 rounded-lg shadow-lg">
            {results.map((item) => (
              <li
                key={item._id}
                className="p-4 border-b border-gray-100 cursor-pointer hover:bg-serene-sky transition duration-300 ease-in-out"
                onClick={() => openModal(item.title || item.question, item.description || item.content || item.answer)}
              >
                <strong className="text-indigo-900">{item.title || item.question}</strong>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>

      <Modal
        isOpen={isModalOpen}
        closeModal={closeModal}
        title={modalTitle}
        content={modalContent}
      />
    </div>
  );
};

export default SearchWindow;
