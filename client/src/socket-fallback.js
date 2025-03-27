// Socket.IO fallback loader
(function() {
  if (typeof io === 'undefined') {
    console.log('Socket.IO not loaded from CDN, using local fallback');
    
    // Create a script element to load the local Socket.IO file
    const script = document.createElement('script');
    script.src = 'socket.io.min.js';
    script.async = true;
    script.onload = function() {
      console.log('Local Socket.IO fallback loaded successfully');
    };
    script.onerror = function(error) {
      console.error('Failed to load local Socket.IO fallback:', error);
    };
    
    // Append the script to the document
    document.head.appendChild(script);
  } else {
    console.log('Socket.IO already loaded from CDN');
  }
})();
