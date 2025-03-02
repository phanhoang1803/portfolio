// frontend/src/components/PostCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './PostCard.css';

const PostCard = ({ post }) => {
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="postcard">
      {/* Featured image */}
      {post.featured_image && (
        <div className="postcard-image">
          <img
            src={post.featured_image}
            alt={post.title}
            className="postcard-img"
          />
        </div>
      )}
      
      {/* Content */}
      <div className="postcard-content">
        {/* Title */}
        <Link to={`/post/${post.slug}`} className="postcard-title">
          <h2>{post.title}</h2>
        </Link>
        
        {/* Summary */}
        {post.summary && (
          <p className="postcard-summary">
            {post.summary.length > 120
              ? `${post.summary.substring(0, 120)}...`
              : post.summary}
          </p>
        )}
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="postcard-tags">
            {post.tags.map((tag) => (
              <span key={tag} className="postcard-tag">{tag}</span>
            ))}
          </div>
        )}
        
        {/* Footer */}
        <div className="postcard-footer">
          <span className="postcard-date">{formatDate(post.created_at)}</span>
          <Link to={`/post/${post.slug}`} className="postcard-readmore">
            Read more
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
