// js/list.js
import { collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

export async function renderList(containerId, db) {
    const container = document.getElementById(containerId);
    
    // Show loading skeleton first
    container.innerHTML = `
        <div class="flex gap-4 overflow-x-auto no-scrollbar pr-4 pb-2">
            ${[1,2,3,4,5].map(() => `
                <div class="flex flex-col items-center gap-1 shrink-0 animate-pulse">
                    <div class="w-14 h-14 rounded-full bg-gray-200 dark:bg-white/10"></div>
                    <div class="w-10 h-2 bg-gray-200 dark:bg-white/10 rounded"></div>
                </div>
            `).join('')}
        </div>
    `;

    try {
        // Fetch the 10 most recent posts
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(10));
        const postsSnap = await getDocs(q);
        
        // We only want unique users (so if one person posted 3 times, they only show up once in the top list)
        const recentUsersMap = new Map();
        
        postsSnap.forEach(doc => {
            const post = doc.data();
            const postId = doc.id;
            
            // If we haven't added this user yet, add them and link to their newest post
            if (!recentUsersMap.has(post.userId)) {
                recentUsersMap.set(post.userId, {
                    username: post.user,
                    photoURL: post.userPhoto || null,
                    postId: postId
                });
            }
        });

        const recentUsers = Array.from(recentUsersMap.values());

        // Default PFP if they don't have one
        const defaultPfp = (initial) => `<div class="w-14 h-14 rounded-full bg-electric text-white flex items-center justify-center font-bold text-lg uppercase ring-2 ring-offset-2 ring-electric dark:ring-offset-black shrink-0">${initial}</div>`;

        if (recentUsers.length === 0) {
            container.innerHTML = `<div class="text-xs text-gray-500 px-4">No recent activity.</div>`;
            return;
        }

        // Generate the HTML for the users
        let listHTML = recentUsers.map(u => {
            const pfpHtml = u.photoURL 
                ? `<img src="${u.photoURL}" class="w-14 h-14 rounded-full object-cover ring-2 ring-offset-2 ring-electric dark:ring-offset-black shrink-0">` 
                : defaultPfp(u.username.charAt(0));

            return `
                <div class="flex flex-col items-center gap-1 shrink-0 cursor-pointer active:scale-95 transition-transform" onclick="openPostModal('${u.postId}')">
                    <div class="p-[2px] rounded-full bg-gradient-to-tr from-electric to-purple-500">
                        <div class="bg-white dark:bg-darkBg rounded-full p-[2px]">
                            ${pfpHtml}
                        </div>
                    </div>
                    <span class="text-[10px] font-bold truncate w-16 text-center dark:text-white">${u.username}</span>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="flex gap-4 overflow-x-auto no-scrollbar pr-4 pb-2">
                ${listHTML}
            </div>
        `;

    } catch (error) {
        console.error("Error fetching recent post list:", error);
        container.innerHTML = `<div class="text-xs text-red-500 px-4">Failed to load active users.</div>`;
    }
}
