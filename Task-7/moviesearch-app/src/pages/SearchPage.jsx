import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMovies } from '../services/api';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e, newPage = 1) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchMovies(query, newPage, type);
      if (data.Response === 'True') {
        setMovies(data.Search);
        setTotalResults(parseInt(data.totalResults, 10));
        setPage(newPage);
      } else {
        setMovies([]);
        setTotalResults(0);
        setError(data.Error); // "Movie not found!" from API
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Automatically trigger search when the type filter changes (if a query exists)
  useEffect(() => {
    if (query) {
      handleSearch(null, 1);
    }
  }, [type]);

  const totalPages = Math.ceil(totalResults / 10); // OMDB returns 10 items per page

  return (
    <div className="flex flex-col items-center">
      <form onSubmit={(e) => handleSearch(e, 1)} className="w-full max-w-2xl flex gap-2 mb-8">
        <input
          type="text"
          placeholder="Search for movies, series..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="p-3 rounded-lg bg-gray-800 text-white focus:outline-none"
        >
          <option value="all">All Types</option>
          <option value="movie">Movies</option>
          <option value="series">Series</option>
          <option value="episode">Episodes</option>
        </select>
        <button type="submit" className="bg-yellow-400 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-yellow-500">
          Search 🔎
        </button>
      </form>

      {loading && <p className="text-xl">Loading...</p>}
      {error && <p className="text-red-400 text-xl">{error}</p>}

      {!loading && !error && movies.length > 0 && (
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <Link to={`/movie/${movie.imdbID}`} key={movie.imdbID} className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200">
                <img
                  src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}
                  alt={movie.Title}
                  className="w-full h-[400px] object-cover"
                />
                <div className="p-4">
                  <h2 className="text-lg font-bold truncate">{movie.Title}</h2>
                  <p className="text-gray-400">{movie.Year} • <span className="capitalize">{movie.Type}</span></p>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-8">
              <button 
                disabled={page === 1} 
                onClick={() => handleSearch(null, page - 1)}
                className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="py-2">Page {page} of {totalPages}</span>
              <button 
                disabled={page === totalPages} 
                onClick={() => handleSearch(null, page + 1)}
                className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
