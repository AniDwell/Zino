// js/search.js
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

export function initSearch(db) {
    // 1. Create the Full-Screen Overlay HTML
    const overlay = document.createElement('div');
    overlay.id = 'search-overlay';
    // Tailwind classes for a smooth slide-up animation and safe mobile areas
    overlay.className = 'fixed inset-0 bg-white dark:bg-darkBg z-[100] transform translate-y-full transition-all duration-300 flex flex-col opacity-0 pointer-events-none';
    
    overlay.innerHTML = `
        <!-- Header -->
        <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-white/90 dark:bg-black/90 backdrop-blur-xl">
            <button id="close-search" class="p-2 -ml-2 text-gray-900 dark:text-white active:scale-90 transition-transform">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </button>
            <div class="flex-1 relative">
                <input type="text" id="active-search-input" placeholder="Search accounts and posts..." class="w-full bg-gray-100 dark:bg-darkSurface border border-transparent dark:border-white/10 rounded-full py-2 pl-4 pr-10 text-sm outline-none text-gray-900 dark:text-white placeholder-gray-500 focus:border-electric dark:focus:border-white transition-colors" autocomplete="off">
                <button id="clear-search" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white hidden">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-gray-200 dark:border-white/10">
            <button class="search-tab flex-1 py-3 text-sm font-bold border-b-2 border-black dark:border-white text-black dark:text-white transition-colors" data-tab="all">All</button>
            <button class="search-tab flex-1 py-3 text-sm font-bold border-b-2 border-transparent text-gray-400 transition-colors" data-tab="accounts">Accounts</button>
            <button class="search-tab flex-1 py-3 text-sm font-bold border-b-2 border-transparent text-gray-400 transition-colors" data-tab="posts">Posts</button>
        </div>

        <!-- Results Area -->
        <div id="search-results" class="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar bg-gray-50 dark:bg-darkBg">
            <div class="text-center text-gray-400 text-sm mt-10 font-bold opacity-50">Type something to search...</div>
        </div>
    `;

    document.body.appendChild(overlay);

    // 2. DOM Elements
    const activeInput = document.getElementById('active-search-input');
    const clearBtn = document.getElementById('clear-search');
    const closeBtn = document.getElementById('close-search');
    const resultsContainer = document.getElementById('search-results');
    const tabs = document.querySelectorAll('.search-tab');
    
    let currentTab = 'all';
    let searchTimeout = null;

    // Default PFP SVG
    const defaultPfp = `<div class="w-12 h-12 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                            <svg class="w-6 h-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </div>`;

    // 3. Hook up the original search bar from home.html to open this overlay
    setTimeout(() => {
        const dummyInput = document.querySelector('#top-bar-container input');
        if (dummyInput) {
            dummyInput.addEventListener('focus', (e) => {
                e.preventDefault();
                dummyInput.blur(); // Unfocus dummy
                openOverlay();
            });
        }
    }, 500);

    // 4. Overlay Controls
    const openOverlay = () => {
        overlay.classList.remove('translate-y-full', 'opacity-0', 'pointer-events-none');
        overlay.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
        setTimeout(() => activeInput.focus(), 300); // Focus input after animation
    };

    const closeOverlay = () => {
        overlay.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
        overlay.classList.add('translate-y-full', 'opacity-0', 'pointer-events-none');
        activeInput.value = '';
        clearBtn.classList.add('hidden');
        resultsContainer.innerHTML = `<div class="text-center text-gray-400 text-sm mt-10 font-bold opacity-50">Type something to search...</div>`;
    };

    closeBtn.addEventListener('click', closeOverlay);
    
    clearBtn.addEventListener('click', () => {
        activeInput.value = '';
        clearBtn.classList.add('hidden');
        activeInput.focus();
        performSearch('');
    });

    // 5. Tab Switching Logic
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Reset tabs
            tabs.forEach(t => {
                t.classList.remove('border-black', 'dark:border-white', 'text-black', 'dark:text-white');
                t.classList.add('border-transparent', 'text-gray-400');
            });
            // Activate clicked tab
            tab.classList.remove('border-transparent', 'text-gray-400');
            tab.classList.add('border-black', 'dark:border-white', 'text-black', 'dark:text-white');
            
            currentTab = tab.dataset.tab;
            performSearch(activeInput.value.trim()); // Re-search with new filter
        });
    });

    // 6. Search Logic (Debounced to save Firestore reads)
    activeInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length > 0) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 400); // Waits 400ms after typing stops before querying
    });

    async function performSearch(queryStr) {
        if (!queryStr) {
            resultsContainer.innerHTML = `<div class="text-center text-gray-400 text-sm mt-10 font-bold opacity-50">Type something to search...</div>`;
            return;
        }

        resultsContainer.innerHTML = `
            <div class="flex justify-center mt-10">
                <div class="w-6 h-6 border-2 border-gray-300 dark:border-white/20 border-t-black dark:border-t-white rounded-full animate-spin"></div>
            </div>`;

        const q = queryStr.toLowerCase();
        let usersHtml = '';
        let postsHtml = '';

        try {
            // Fetch Users
            if (currentTab === 'all' || currentTab === 'accounts') {
                const usersSnap = await getDocs(collection(db, "users"));
                const matchedUsers = [];
                
                usersSnap.forEach(doc => {
                    const u = doc.data();
                    // Check username, display name, or bio
                    if (
                        (u.username && u.username.toLowerCase().includes(q)) ||
                        (u.displayName && u.displayName.toLowerCase().includes(q)) ||
                        (u.bio && u.bio.toLowerCase().includes(q))
                    ) {
                        matchedUsers.push(u);
                    }
                });

                if (matchedUsers.length > 0) {
                    usersHtml = `<h3 class="text-xs font-bold uppercase tracking-wider opacity-50 mb-2 mt-4 px-2">Accounts</h3>`;
                    usersHtml += matchedUsers.map(u => `
                        <div class="flex items-center gap-4 p-3 bg-white dark:bg-darkSurface border border-gray-100 dark:border-white/5 rounded-2xl active:scale-95 transition-transform cursor-pointer shadow-sm">
                            ${u.photoURL ? `<img src="${u.photoURL}" class="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-white/10 shrink-0">` : defaultPfp}
                            <div class="flex-1 overflow-hidden">
                                <h4 class="font-bold text-sm truncate dark:text-white">${u.displayName}</h4>
                                <p class="text-xs text-gray-500 truncate">@${u.username}</p>
                            </div>
                            <button class="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-full hover:opacity-90 transition-opacity">View</button>
                        </div>
                    `).join('');
                }
            }

            // Fetch Posts
            if (currentTab === 'all' || currentTab === 'posts') {
                try {
                    const postsSnap = await getDocs(collection(db, "posts"));
                    const matchedPosts = [];
                    
                    postsSnap.forEach(doc => {
                        const p = doc.data();
                        // Check post text or title
                        if (
                            (p.text && p.text.toLowerCase().includes(q)) ||
                            (p.title && p.title.toLowerCase().includes(q)) ||
                            (p.user && p.user.toLowerCase().includes(q))
                        ) {
                            matchedPosts.push(p);
                        }
                    });

                    if (matchedPosts.length > 0) {
                        postsHtml = `<h3 class="text-xs font-bold uppercase tracking-wider opacity-50 mb-2 mt-6 px-2">Posts</h3>`;
                        postsHtml += matchedPosts.map(p => `
                            <div class="p-4 bg-white dark:bg-darkSurface border border-gray-100 dark:border-white/5 rounded-2xl mb-3 shadow-sm cursor-pointer active:scale-[0.98] transition-transform">
                                <div class="flex items-center gap-2 mb-2">
                                    <div class="w-6 h-6 rounded-full bg-electric text-white flex items-center justify-center font-bold text-[10px] uppercase">${p.user.charAt(0)}</div>
                                    <span class="text-xs font-bold">${p.user}</span>
                                </div>
                                ${p.title ? `<h4 class="font-bold text-sm mb-1">${p.title}</h4>` : ''}
                                <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">${p.text}</p>
                            </div>
                        `).join('');
                    }
                } catch (e) {
                    // Ignore error if 'posts' collection doesn't exist yet
                    console.log("No posts collection found yet.");
                }
            }

            // Render Output
            if (!usersHtml && !postsHtml) {
                resultsContainer.innerHTML = `
                    <div class="flex flex-col items-center justify-center mt-16 opacity-50">
                        <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        <p class="text-sm font-bold">No results found for "${queryStr}"</p>
                    </div>`;
            } else {
                resultsContainer.innerHTML = usersHtml + postsHtml;
            }

        } catch (error) {
            console.error("Search error:", error);
            resultsContainer.innerHTML = `<div class="text-center text-red-500 text-sm mt-10">An error occurred while searching.</div>`;
        }
    }
}
