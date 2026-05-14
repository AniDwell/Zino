import { collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

export async function renderFeed(containerId, db) {
    const container = document.getElementById(containerId);
    
    // 1. Show a loading skeleton while fetching posts
    container.innerHTML = `
        <div class="w-full max-w-md mx-auto space-y-6">
            ${[1, 2, 3].map(() => `
                <div class="bg-white dark:bg-darkSurface border border-gray-200 dark:border-white/10 rounded-2xl p-4 animate-pulse">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10"></div>
                        <div class="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/3"></div>
                    </div>
                    <div class="h-32 bg-gray-200 dark:bg-white/10 rounded-xl mb-4"></div>
                </div>
            `).join('')}
        </div>
    `;

    try {
        // 2. Fetch posts from Firestore (Newest first)
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const postsSnap = await getDocs(q);
        
        if (postsSnap.empty) {
            container.innerHTML = `<div class="text-center text-gray-500 py-10">No posts yet. Be the first to post!</div>`;
            return;
        }

        const defaultPfp = (initial) => `<div class="w-10 h-10 rounded-full bg-electric text-white flex items-center justify-center font-bold text-sm uppercase shrink-0">${initial}</div>`;

        // 3. Build the Feed HTML
        let feedHTML = '';
        postsSnap.forEach(doc => {
            const post = doc.data();
            const postId = doc.id;
            
            const pfpHtml = post.userPhoto 
                ? `<img src="${post.userPhoto}" class="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200 dark:border-white/10">` 
                : defaultPfp(post.user ? post.user.charAt(0) : '?');

            feedHTML += `
                <article class="bg-white dark:bg-darkSurface border border-gray-200 dark:border-white/10 rounded-2xl p-4 shadow-sm mb-6">
                    
                    <!-- Post Header: PFP, Name, Follow Button -->
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-3 cursor-pointer">
                            ${pfpHtml}
                            <div>
                                <h4 class="text-sm font-bold leading-none dark:text-white">${post.user}</h4>
                                <span class="text-[10px] text-gray-500">${post.timeAgo || 'Recently'}</span>
                            </div>
                        </div>
                        <button onclick="handleFollow('${post.userId}')" class="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-full active:scale-95 transition-transform">
                            Follow
                        </button>
                    </div>
                    
                    <!-- Post Body: Clickable to open exp.js -->
                    <div class="cursor-pointer active:opacity-80 transition-opacity" onclick="triggerExp('${postId}')">
                        ${post.title ? `<h3 class="font-bold text-lg mb-1 dark:text-white">${post.title}</h3>` : ''}
                        <p class="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">${post.text || ''}</p>
                        
                        ${post.imageUrl ? `
                            <div class="w-full rounded-xl overflow-hidden mb-4 border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black">
                                <img src="${post.imageUrl}" class="w-full object-cover max-h-80" loading="lazy">
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Post Footer: Action Buttons -->
                    <div class="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
                        <div class="flex items-center gap-6">
                            <!-- Like Button -->
                            <button onclick="handleLike('${postId}')" class="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 active:scale-90 transition-all dark:text-white">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                                <span class="font-bold">${post.likes || 0}</span>
                            </button>
                            
                            <!-- Comment Button (triggers comment.js) -->
                            <button onclick="triggerComment('${postId}')" class="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 active:scale-90 transition-all dark:text-white">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                <span class="font-bold">${post.comments || 0}</span>
                            </button>
                        </div>
                        
                        <!-- Share Button (triggers share.js) -->
                        <button onclick="triggerShare('${postId}')" class="p-2 opacity-70 hover:opacity-100 active:scale-90 transition-all dark:text-white">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                        </button>
                    </div>
                </article>
            `;
        });

        container.innerHTML = feedHTML;

    } catch (error) {
        console.error("Error fetching feed:", error);
        container.innerHTML = `<div class="text-center text-red-500 py-10">Error loading feed.</div>`;
    }
}

// ==========================================
// DYNAMIC MODULE LOADERS (The Connections)
// ==========================================

// 1. Expand Post (exp.js)
window.triggerExp = async (postId) => {
    try {
        const module = await import('./exp.js');
        module.openExpandedPost(postId);
    } catch (err) {
        console.log("Create exp.js to handle this!", err);
    }
};

// 2. Comments (comment.js)
window.triggerComment = async (postId) => {
    try {
        const module = await import('./comment.js');
        module.openCommentsModal(postId);
    } catch (err) {
        console.log("Create comment.js to handle this!", err);
    }
};

// 3. Share (share.js)
window.triggerShare = async (postId) => {
    try {
        const module = await import('./share.js');
        module.openShareMenu(postId);
    } catch (err) {
        console.log("Create share.js to handle this!", err);
        // Fallback Native Share for mobile if share.js isn't ready
        if (navigator.share) {
            navigator.share({
                title: 'Check out this post on Artist Hub',
                url: window.location.origin + '/home.html?post=' + postId
            });
        }
    }
};

// 4. Follow Button Logic (Placeholder for your database logic)
window.handleFollow = (userId) => {
    // Add your Firebase logic here to add this user to the current user's 'following' array
    event.target.innerText = 'Following';
    event.target.classList.replace('bg-black', 'bg-gray-200');
    event.target.classList.replace('text-white', 'text-black');
    event.target.classList.replace('dark:bg-white', 'dark:bg-white/20');
    event.target.classList.replace('dark:text-black', 'dark:text-white');
};

window.handleLike = (postId) => {
    // Basic UI toggle for liking
    const btn = event.currentTarget;
    btn.classList.toggle('text-red-500');
    btn.querySelector('svg').setAttribute('fill', btn.classList.contains('text-red-500') ? 'currentColor' : 'none');
    
    // Add your Firebase updateDoc logic here to increment the like count
};
