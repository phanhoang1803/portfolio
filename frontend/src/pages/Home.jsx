// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsApi } from '../services/api';
import PostCard from '../components/PostCard';
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await postsApi.getPosts(page, 6, selectedTag, searchTerm);
        setPosts(response.data.posts);
        setTotalPages(response.data.pages);

        const tags = response.data.posts
          .flatMap(post => post.tags)
          .filter((tag, index, self) => tag && self.indexOf(tag) === index);

        setAllTags(tags);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to fetch posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, selectedTag, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleTagClick = (tag) => {
    setSelectedTag(tag === selectedTag ? null : tag);
    setPage(1);
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Academic Portfolio</h1>
        <p>A collection of academic articles, research, and resources</p>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {allTags.length > 0 && (
        <div className="tag-filters">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={selectedTag === tag ? 'active' : ''}
            >
              {tag}
            </button>
          ))}
          {selectedTag && (
            <button onClick={() => setSelectedTag(null)} className="clear-filter">
              Clear filter
            </button>
          )}
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <div className="posts-grid">
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post._id} post={post} />)
          ) : (
            <div className="no-posts">No posts found</div>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;