document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  const postsSection = document.getElementById('posts-section');
  const postsContainer = document.getElementById('posts-container');

  // Handle signup
  signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = e.target.username.value;
      const email = e.target.email.value;
      const password = e.target.password.value;

      const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();
      if (response.ok) {
          localStorage.setItem('token', data.token);
          alert('Signup successful');
          showPostsSection();
      } else {
          alert(data.msg || 'Error during signup');
      }
  });

  // Handle login
  loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = e.target.email.value;
      const password = e.target.password.value;

      const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (response.ok) {
          localStorage.setItem('token', data.token);
          alert('Login successful');
          showPostsSection();
      } else {
          alert(data.msg || 'Login failed');
      }
  });

  // Function to show posts section
  function showPostsSection() {
      document.getElementById('signup-section').classList.add('hidden');
      document.getElementById('login-section').classList.add('hidden');
      postsSection.classList.remove('hidden');
      loadPosts();
  }

  // Function to load posts (mocked for now)
  function loadPosts() {
      const posts = [
          { user: 'Alice', content: 'Hello, world!' },
          { user: 'Bob', content: 'I love coding!' }
      ];

      posts.forEach(post => {
          const postDiv = document.createElement('div');
          postDiv.classList.add('post');
          postDiv.innerHTML = `<strong>${post.user}</strong><p>${post.content}</p>`;
          postsContainer.appendChild(postDiv);
      });
  }
});
