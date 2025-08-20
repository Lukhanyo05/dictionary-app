import { useState } from 'react'
import './App.css'

function App() {
  // State variables for our app
  const [word, setWord] = useState('') // Stores the word to search for
  const [definitions, setDefinitions] = useState([]) // Stores the definitions from API
  const [isLoading, setIsLoading] = useState(false) // Tracks loading state
  const [error, setError] = useState(null) // Stores any error messages
  const [searchHistory, setSearchHistory] = useState([]) // Tracks search history

  // Function to handle the word search
  const handleSearch = async (e) => {
    e.preventDefault() // Prevent form from refreshing the page
    
    if (!word.trim()) return // Don't search if word is empty
    
    setIsLoading(true) // Show loading state
    setError(null) // Clear previous errors
    
    try {
      // Fetch data from Merriam-Webster API
      const response = await fetch(
        `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${import.meta.env.VITE_MW_API_KEY}`
      )
      
      // Check if the API response is successful
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json() // Parse the JSON response
      
      // Check if we got valid definitions
      if (data.length === 0 || typeof data[0] === 'string') {
        setDefinitions([])
        setError(`No definition found for "${word}". Did you mean: ${data.join(', ')}?`)
      } else {
        // Extract definitions from the API response
        const wordDefinitions = data.map(entry => ({
          word: entry.meta.id, // The word itself
          partOfSpeech: entry.fl, // Part of speech (noun, verb, etc.)
          definition: entry.shortdef?.[0] || 'No definition available', // Short definition
          examples: entry.hwi?.prs?.[0]?.sound?.audio || null // Audio pronunciation if available
        }))
        
        setDefinitions(wordDefinitions) // Update state with definitions
        setError(null) // Clear any errors
        
        // Add to search history (limit to 10 most recent)
        setSearchHistory(prev => {
          const newHistory = [word, ...prev.filter(item => item !== word)]
          return newHistory.slice(0, 10)
        })
      }
    } catch (err) {
      setError(`Failed to fetch definition: ${err.message}`) // Set error message
      setDefinitions([]) // Clear definitions
    } finally {
      setIsLoading(false) // Hide loading state
    }
  }

  // Function to handle clicking on a word in search history
  const handleHistoryClick = (historyWord) => {
    setWord(historyWord) // Set the clicked word as current search term
  }

  return (
    <div className="app">
      {/* Personalized header with your name */}
      <header className="app-header">
        <h1>Lukhanyo's Personal Dictionary</h1>
        <p>Discover definitions and expand your vocabulary</p>
      </header>
      
      {/* Search form */}
      <form onSubmit={handleSearch} className="search-form">
        <div className="input-group">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Enter a word to look up..."
            className="search-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="search-button"
            disabled={isLoading || !word.trim()}
          >
            {isLoading ? 'Searching...' : 'Define'}
          </button>
        </div>
      </form>
      
      {/* Display search history if we have any */}
      {searchHistory.length > 0 && (
        <div className="search-history">
          <h3>Recent Searches:</h3>
          <div className="history-tags">
            {searchHistory.map((historyWord, index) => (
              <span
                key={index}
                className="history-tag"
                onClick={() => handleHistoryClick(historyWord)}
              >
                {historyWord}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Display error messages if any */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {/* Display loading state */}
      {isLoading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Searching for "{word}"...</p>
        </div>
      )}
      
      {/* Display definitions*/}
      {definitions.length > 0 && !isLoading && (
        <div className="definitions">
          <h2>Definitions for "{definitions[0].word.split(':')[0]}"</h2>
          {definitions.map((def, index) => (
            <div key={index} className="definition-card">
              <h3>
                {def.word.split(':')[0]} 
                {def.partOfSpeech && <span className="part-of-speech"> ({def.partOfSpeech})</span>}
              </h3>
              <p className="definition">{def.definition}</p>
              {def.examples && (
                <div className="audio-container">
                  <p>Pronunciation:</p>
                  <audio controls className="audio-player">
                    <source 
                      src={`https://media.merriam-webster.com/audio/prons/en/us/mp3/${def.examples.charAt(0)}/${def.examples}.mp3`} 
                      type="audio/mp3" 
                    />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Footer with of the page */}
      <footer className="app-footer">
        <p>Built with ❤️ for words using React, Vite, and the Merriam-Webster Dictionary API</p>
      </footer>
    </div>
  )
}

export default App