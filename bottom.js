export function renderBottomMenu(containerId) {
    const container = document.getElementById(containerId);

    container.innerHTML = `
        <div class="flex items-center justify-around py-3 px-6 max-w-md mx-auto">
            
            <!-- 1. Home (Active State) -->
            <button class="p-2 text-black dark:text-white transition-transform active:scale-90">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path>
                </svg>
            </button>
            
            <!-- 2. Explore (Magnifying Glass) -->
            <button class="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-transform active:scale-90" onclick="document.querySelector('#active-search-input')?.focus()">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
            </button>

            <!-- 3. Upload (Prominent Center Floating Button) -->
            <button class="p-3 bg-black text-white dark:bg-white dark:text-black rounded-full shadow-lg transform -translate-y-4 hover:scale-105 active:scale-95 transition-all ring-4 ring-white dark:ring-black">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path>
                </svg>
            </button>

            <!-- 4. Notifications (Bell with indicator dot) -->
            <button class="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-transform active:scale-90 relative">
                <!-- Red dot indicator -->
                <div class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-black"></div>
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
            </button>

            <!-- 5. Chat (Message Bubble) -->
            <button class="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-transform active:scale-90 relative">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
            </button>

        </div>
    `;
}
