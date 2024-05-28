var posts=["2024/04/27/hello-world/","2024/05/28/makeX/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };