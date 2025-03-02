// frontend/src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const Admin = () => {
  const { user } = useAuth();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await postsApi.getPosts(page, 10);
        setPosts(response.data.posts);
        setTotalPages(response.data.pages);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to fetch posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      try {
        await postsApi.deletePost(id);
        setPosts(posts.filter(post => post._id !== id));
      } catch (err) {
        console.error('Error deleting post:', err);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <Link to="/admin/new" className="btn-new-post">New Post</Link>
      </div>

      <div className="admin-welcome">
        <h2>Welcome, {user?.username || 'Admin'}!</h2>
        <p>This is your admin dashboard. Here you can manage your posts.</p>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="admin-loading">Loading posts...</td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan="4" className="admin-empty">No posts found. Create your first post!</td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post._id} className="table-row">
                  <td>
                    <Link to={`/post/${post.slug}`} className="admin-post-link">{post.title}</Link>
                  </td>
                  <td>
                    <span className={post.is_published ? 'status-published' : 'status-draft'}>
                      {post.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>{formatDate(post.created_at)}</td>
                  <td>
                    <div className="admin-actions">
                      <Link to={`/admin/edit/${post.slug}`} className="btn-edit">Edit</Link>
                      <button onClick={() => handleDelete(post._id, post.title)} className="btn-delete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="admin-pagination">
          <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className={`pagination-btn ${page === 1 ? 'disabled' : ''}`}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages} className={`pagination-btn ${page === totalPages ? 'disabled' : ''}`}>Next</button>
        </div>
      )}
    </div>
  );
};

export default Admin;
