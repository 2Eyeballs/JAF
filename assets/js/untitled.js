const blogPosts = [
  {
    title: "All photographs are accurate",
    excerpt: "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
    image: "https://via.placeholder.com/800x280/87CEFA/000000",
    url: "blog-details.html"
  },
  {
    title: "New rules, more cars, more races",
    excerpt: "This is another post excerpt...",
    image: "https://via.placeholder.com/800x280/FFA07A/000000",
    url: "blog-details.html"
  }
];
const blogContainer = document.getElementById('blog-loop');

// Pick the latest post (first item)
const latestPost = blogPosts[0];

// Create card HTML
const postCard = `
  <div class="col">
    <article class="card border-0 h-100">
      <img src="${latestPost.image}" class="card-img-top img-fluid" alt="${latestPost.title}">
      <div class="card-body">
        <h3 class="card-title">
          <a href="${latestPost.url}">${latestPost.title}</a>
        </h3>
        <p class="card-text">${latestPost.excerpt}</p>
      </div>
    </article>
  </div>
`;



// Inject into the container
blogContainer.innerHTML = postCard;