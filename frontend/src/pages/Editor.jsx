// frontend/src/pages/Editor.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { lowlight } from 'lowlight/lib/core';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { postsApi } from '../services/api';
import './Editor.css';

// Image Upload Component
const ImageUploadButton = ({ editor }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    try {
      setUploading(true);
      
      // Use the existing API function to upload the image
      const response = await postsApi.uploadImage(file);
      const imageUrl = response.data.url;
      
      // Insert the image at the current cursor position
      if (imageUrl && editor) {
        editor.chain().focus().setImage({ src: imageUrl, alt: file.name }).run();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <>
      <button
        onClick={triggerFileInput}
        title="Upload Image"
        disabled={uploading || !editor}
        className={uploading ? 'is-loading' : ''}
      >
        <span className="toolbar-icon">
          {uploading ? '⏳' : '📷'}
        </span>
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </>
  );
};

// Toolbar component for TipTap
const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="editor-toolbar">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
        title="Bold"
      >
        <span className="toolbar-icon">B</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
        title="Italic"
      >
        <span className="toolbar-icon">I</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'is-active' : ''}
        title="Underline"
      >
        <span className="toolbar-icon">U</span>
      </button>
      <div className="toolbar-divider"></div>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        title="Heading 1"
      >
        <span className="toolbar-icon">H1</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        title="Heading 2"
      >
        <span className="toolbar-icon">H2</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
        title="Heading 3"
      >
        <span className="toolbar-icon">H3</span>
      </button>
      <div className="toolbar-divider"></div>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
        title="Bullet List"
      >
        <span className="toolbar-icon">•</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}
        title="Ordered List"
      >
        <span className="toolbar-icon">1.</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive('codeBlock') ? 'is-active' : ''}
        title="Code Block"
      >
        <span className="toolbar-icon">{"<>"}</span>
      </button>
      <div className="toolbar-divider"></div>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'is-active' : ''}
        title="Quote"
      >
        <span className="toolbar-icon">"</span>
      </button>
      <button
        onClick={() => {
          const url = window.prompt('URL');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={editor.isActive('link') ? 'is-active' : ''}
        title="Link"
      >
        <span className="toolbar-icon">🔗</span>
      </button>
      
      {/* Upload image button */}
      <ImageUploadButton editor={editor} />
      
      {/* External image URL button */}
      <button
        onClick={() => {
          const url = window.prompt('Image URL');
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }}
        title="Insert Image from URL"
      >
        <span className="toolbar-icon">🖼️</span>
      </button>
      
      <div className="toolbar-divider"></div>
      <button 
        onClick={() => editor.chain().focus().undo().run()}
        title="Undo"
      >
        <span className="toolbar-icon">↩️</span>
      </button>
      <button 
        onClick={() => editor.chain().focus().redo().run()}
        title="Redo"
      >
        <span className="toolbar-icon">↪️</span>
      </button>
    </div>
  );
};

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [slug, setSlug] = useState('');
  const [tags, setTags] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Image,
      Placeholder.configure({
        placeholder: 'Start writing your post here...',
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      // Convert the content to HTML when needed
      setContent(editor.getHTML());
    },
  });

  // Set editor content when the content state changes from outside
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  // Load post data if editing
  useEffect(() => {
    if (isEditing) {
      const fetchPost = async () => {
        setLoading(true);
        try {
          const response = await postsApi.getPost(id);
          const post = response.data;
          
          setTitle(post.title);
          setContent(post.content);
          setSummary(post.summary || '');
          setSlug(post.slug);
          setTags(post.tags.join(', '));
          setFeaturedImage(post.featured_image || '');
          setIsPublished(post.is_published);
        } catch (err) {
          console.error('Error fetching post:', err);
          setError('Failed to load post data. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      fetchPost();
    }
  }, [id, isEditing]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !content) {
      setError('Title and content are required.');
      return;
    }
    
    setSaving(true);
    setError('');
    setMessage('');
    
    try {
      // Parse tags
      const parsedTags = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
      
      // Prepare post data
      const postData = {
        title,
        content,
        summary: summary || null,
        slug: slug || null, // Will be auto-generated if not provided
        tags: parsedTags,
        featured_image: featuredImage || null,
        is_published: isPublished,
      };
      
      // Upload featured image if provided
      if (imageFile) {
        try {
          const response = await postsApi.uploadImage(imageFile);
          postData.featured_image = response.data.url;
        } catch (uploadErr) {
          console.error('Error uploading image:', uploadErr);
          setError('Failed to upload image. Post will be saved without the new image.');
        }
      }
      
      // Create or update post
      let response;
      if (isEditing) {
        response = await postsApi.updatePost(id, postData);
      } else {
        response = await postsApi.createPost(postData);
      }
      
      setMessage(`Post ${isEditing ? 'updated' : 'created'} successfully!`);
      
      // Navigate to the post or admin page after a short delay
      setTimeout(() => {
        navigate(isPublished ? `/post/${response.data.slug}` : '/admin');
      }, 1500);
    } catch (err) {
      console.error('Error saving post:', err);
      setError(`Failed to ${isEditing ? 'update' : 'create'} post. Please try again.`);
    } finally {
      setSaving(false);
    }
  };
  
  // Generate slug from title
  const generateSlug = () => {
    const generatedSlug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
    
    setSlug(generatedSlug);
  };
  
  // Handle featured image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Show preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setFeaturedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Remove featured image
  const removeFeaturedImage = () => {
    setFeaturedImage('');
    setImageFile(null);
    document.getElementById('featuredImage').value = '';
  };
  
  return (
    <div className="editor-wrapper">
      <div className="editor-container">
        <div className="editor-header">
          <h1 className="editor-title">
            {isEditing ? 'Edit Post' : 'Create New Post'}
          </h1>
          <div className="editor-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/admin')}
              disabled={saving}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        
        {/* Error and success messages */}
        {error && (
          <div className="alert alert-error">
            <i className="alert-icon">⚠️</i>
            {error}
          </div>
        )}
        
        {message && (
          <div className="alert alert-success">
            <i className="alert-icon">✓</i>
            {message}
          </div>
        )}
        
        {/* Loading state */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading post data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="editor-form">
            <div className="form-layout">
              <div className="form-main">
                {/* Title */}
                <div className="form-group">
                  <label htmlFor="title" className="form-label">
                    Title <span className="required">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="form-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a compelling title"
                    required
                  />
                </div>
                
                {/* Content */}
                <div className="form-group">
                  <label htmlFor="content" className="form-label">
                    Content <span className="required">*</span>
                  </label>
                  <div className="tiptap-editor-container">
                    <MenuBar editor={editor} />
                    <EditorContent editor={editor} className="tiptap-editor-content" />
                  </div>
                  <div className="editor-tips">
                    <p>
                      <strong>Pro tips:</strong> 
                      Use <kbd>Ctrl+B</kbd> for bold, <kbd>Ctrl+I</kbd> for italic. 
                      Upload images by clicking the camera icon 📷 or paste directly.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="form-sidebar">
                {/* Post Settings Panel */}
                <div className="settings-panel">
                  <h3 className="panel-title">Post Settings</h3>
                  
                  {/* Summary */}
                  <div className="form-group">
                    <label htmlFor="summary" className="form-label">
                      Summary
                    </label>
                    <textarea
                      id="summary"
                      className="form-input"
                      rows="3"
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="A brief summary of your post (optional)"
                    ></textarea>
                    <div className="form-help">Appears in listings and SEO descriptions</div>
                  </div>
                  
                  {/* Slug with auto-generate button */}
                  <div className="form-group">
                    <label htmlFor="slug" className="form-label">
                      URL Slug
                    </label>
                    <div className="input-with-button">
                      <input
                        id="slug"
                        type="text"
                        className="form-input"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="post-url-slug"
                      />
                      <button
                        type="button"
                        onClick={generateSlug}
                        title="Generate slug from title"
                        className="btn-icon"
                      >
                        ⟳
                      </button>
                    </div>
                    <div className="form-help">Will be auto-generated if empty</div>
                  </div>
                  
                  {/* Tags */}
                  <div className="form-group">
                    <label htmlFor="tags" className="form-label">
                      Tags
                    </label>
                    <input
                      id="tags"
                      type="text"
                      className="form-input"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g. mathematics, programming, physics"
                    />
                    <div className="form-help">Separate tags with commas</div>
                  </div>
                  
                  {/* Featured image */}
                  <div className="form-group">
                    <label htmlFor="featuredImage" className="form-label">
                      Featured Image
                    </label>
                    
                    {featuredImage ? (
                      <div className="image-preview-container">
                        <img
                          src={featuredImage}
                          alt="Featured image preview"
                          className="image-preview"
                        />
                        <button
                          type="button"
                          onClick={removeFeaturedImage}
                          className="btn-remove-image"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="image-upload-area">
                        <input
                          id="featuredImage"
                          type="file"
                          accept="image/*"
                          className="file-input"
                          onChange={handleImageChange}
                        />
                        <label htmlFor="featuredImage" className="file-label">
                          <div>
                            <span className="file-icon">📷</span>
                            <span>Choose image or drag & drop</span>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                  
                  {/* Published status */}
                  <div className="form-group">
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id="publish-toggle"
                        className="toggle-input"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                      />
                      <label htmlFor="publish-toggle" className="toggle-label">
                        <span className="toggle-text">
                          {isPublished ? 'Published' : 'Draft'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Submit buttons */}
                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary btn-large"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-small"></span>
                        <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                      </>
                    ) : (
                      <>{isEditing ? 'Update Post' : 'Create Post'}</>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => navigate('/admin')}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Editor;