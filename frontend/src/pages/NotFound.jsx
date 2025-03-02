// frontend/src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex min-h-[70vh] items-center justify-center py-12">
      <div className="text-center">
        <h1 className="mb-4 text-9xl font-bold text-gray-200">404</h1>
        <h2 className="mb-8 text-3xl font-medium text-gray-800">
          Page Not Found
        </h2>
        <p className="mb-8 text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;