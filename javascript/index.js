function showAbout(){
    document.getElementById("aboutBox").style.display = "block";
}
function hideAbout(){
    document.getElementById("aboutBox").style.display = "none";
}

let searchValue = "";
let categoryFilter ="";

/* =========================
   🟢 SEARCH POSTS
========================= */
function searchPosts() {
    searchValue = document.getElementById("searchInput").value.toLowerCase();
    loadPosts();
}

/* =========================
   🟢 LOAD POSTS (instant cache + live update)
========================= */
function loadPosts() {
    let query = db.collection("posts").orderBy("time", "desc");

    if (categoryFilter && categoryFilter.trim() !== "") {
        query = query.where("category", "==", categoryFilter.trim());
    }

    query = query.limit(10);

    // 🔹 Step 1: Show cached posts immediately
    let cached = localStorage.getItem("cachedPosts");
    if (cached) {
        document.getElementById("posts").innerHTML = cached;
    }

    // 🔹 Step 2: Firestore live updates (replace cache silently)
    query.onSnapshot(snapshot => {
        let postsHTML = "";

        snapshot.forEach(doc => {
            let post = doc.data();
            let postId = doc.id;

            let title = (post.title || "").toLowerCase();
            let desc = (post.description || "").toLowerCase();

            let searchMatch =
                searchValue === "" ||
                title.includes(searchValue) ||
                desc.includes(searchValue);

            if (searchMatch) {
                // ✅ Format Firestore timestamp and author
                let postDate = post.time ? post.time.toDate().toLocaleString() : "";
                let author = post.author || "realpesky";

                postsHTML += `
                <div class="post" id="${postId}">
                    <h3>${post.title || ""}</h3>
                    ${post.image ? `<img src="${post.image}">` : ""}
                    <p class="post-desc">
                        ${post.description && post.description.length > 150
                            ? post.description.substring(0,150) + "..."
                            : (post.description || "")}
                    </p>
                    <small>${post.category || ""}</small>
                    <p class="post-meta">
                        Posted by ${author} on ${postDate}
                    </p>
                    ${post.description && post.description.length > 150 ? `
                    <button onclick="toggleReadMore('${postId}', \`${post.description.replace(/`/g,"'")}\`)">
                        Read More
                    </button>` : ""}
                </div>
                `;
            }
        });


        window.addEventListener("scroll", () => {
    document.querySelectorAll(".post").forEach(post => {
        let rect = post.getBoundingClientRect();
        if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
            history.replaceState(null, "", "?post=" + post.id);
        }
    });
});


  // 🔹 Step 3: Update DOM and cache
        document.getElementById("posts").innerHTML = postsHTML;
        localStorage.setItem("cachedPosts", postsHTML);
    });
}

loadPosts();

/* =========================
   🟢 CATEGORY FILTER
========================= */
function filterCategory(category) {
    categoryFilter = category;
    loadPosts();
}

/* =========================
   🟢 READ MORE TOGGLE
========================= */
function toggleReadMore(postId, fullText) {
    let postBox = document.getElementById(postId);
    let desc = postBox.querySelector(".post-desc");

    if (!postBox.dataset.shortText) {
        postBox.dataset.shortText = desc.innerText;
    }

    let isExpanded = postBox.dataset.expanded === "true";

    if (isExpanded) {
        desc.innerText = postBox.dataset.shortText;
        postBox.dataset.expanded = "false";
    } else {
        desc.innerText = fullText;
        postBox.dataset.expanded = "true";
    }
}




