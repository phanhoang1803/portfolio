// frontend/src/pages/PostDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { postsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import markedKatex from 'marked-katex-extension';
import './PostDetail.css';

const PostDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    marked.use(
      markedHighlight({
        langPrefix: 'hljs language-',
        highlight(code, lang) {
          const language = hljs.getLanguage(lang) ? lang : 'plaintext';
          return hljs.highlight(code, { language }).value;
        }
      })
    );
    
    marked.use(
      markedKatex({
        throwOnError: false,
        output: 'html'
      })
    );
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const response = await postsApi.getPost(slug);
        setPost(response.data);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Post not found or not available.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await postsApi.deletePost(post._id);
        navigate('/');
      } catch (err) {
        console.error('Error deleting post:', err);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderContent = (content) => {
    if (!content) return '';
    return { __html: marked.parse(content) };
  };

  return (
    <div className="post-detail-container">
      {loading ? (
        <div className="loading-spinner"></div>
      ) : error ? (
        <div className="post-error">
          <h2>{error}</h2>
          <Link to="/" className="back-link">Return to home</Link>
        </div>
      ) : post ? (
        <article className="post-article">
          <header className="post-header">
            <Link to="/" className="back-link">← Back to posts</Link>
            <h1>{post.title}</h1>
            <div className="post-meta">
              <time>{formatDate(post.created_at)}</time>
              {post.updated_at !== post.created_at && <span>Updated: {formatDate(post.updated_at)}</span>}
            </div>
            {post.tags?.length > 0 && (
              <div className="post-tags">
                {post.tags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            )}
            {isAdmin() && (
              <div className="admin-actions">
                <Link to={`/admin/edit/${post.slug}`} className="btn-edit">Edit post</Link>
                <button onClick={handleDelete} className="btn-delete">Delete post</button>
              </div>
            )}
          </header>
          {post.featured_image && <img src={post.featured_image} alt={post.title} className="post-image" />}
          <div className="post-content" dangerouslySetInnerHTML={renderContent(post.content)} />
        </article>
      ) : null}
    </div>
  );
};

export default PostDetail;
