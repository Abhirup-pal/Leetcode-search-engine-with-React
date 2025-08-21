// import logo from './logo.svg';
import './App.css';
import {useState} from 'react';
import axios from 'axios';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const fetchResults = async (searchQuery) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/search?q=${searchQuery}`)
      setResults(response.data);
    }
    catch(error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResults(query);
  };

  return (
    <div className="App">
      <div className="container mt-5">
        <h1>DSA Search Engine</h1>
        <form onSubmit={handleSearch}>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Enter your search query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary mt-3">Search</button>
        </form>

        <div className="mt-5">
          <h2>Search Results:</h2>
          <div className="row">
            {results.length>0 ? (results.map((result, index) => (
              <div className="col-md-4" key={index}>
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="card-title">{result.title}</h5>
                    <p className="card-text">{result.description}</p>
                    <a href={result.link} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                      Visit Link
                    </a>
                  </div>
                </div>
              </div>
            ))) : "No data found for this query"}
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;
