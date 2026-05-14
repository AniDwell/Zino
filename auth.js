import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your Cardinals
const firebaseConfig = {
    apiKey: "AIzaSyCANvRaHEUA7wkWMhC9_hFyrzU8cjoUo2U",
    authDomain: "thuggish-2cd07.firebaseapp.com",
    projectId: "thuggish-2cd07",
    storageBucket: "thuggish-2cd07.firebasestorage.app",
    messagingSenderId: "221865053567",
    appId: "1:221865053567:web:ad8960c0136ac524269e4a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const IMGBB_API_KEY = "4a683051e76ed12880a42aefa6ed427b";

let isRegisterMode = false;

// Toggle Login/Register
document.getElementById('toggle-view').addEventListener('click', () => {
    isRegisterMode = !isRegisterMode;
    document.getElementById('register-fields').classList.toggle('hidden');
    document.getElementById('form-title').innerText = isRegisterMode ? 'REGISTER' : 'LOGIN';
    document.getElementById('toggle-view').innerText = isRegisterMode ? 'Back to Login' : 'Need an account? Register';
});

// Forgot Password
document.getElementById('forgot-pw').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    if (!email) return alert("Enter email first");
    await sendPasswordResetEmail(auth, email);
    alert("Reset link sent!");
});

// Main Action
document.getElementById('main-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (isRegisterMode) {
        const username = document.getElementById('username').value.toLowerCase().trim();
        const displayName = document.getElementById('display-name').value;
        const age = parseInt(document.getElementById('age').value);

        // CARDINAL: Age Restriction Logic
        if (age < 15 && username !== "zuno official") {
            alert("Registration denied. You do not meet the age requirement.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save user data to Firestore
            await setDoc(doc(db, "users", user.uid), {
                username,
                displayName,
                age,
                email,
                uid: user.uid
            });

            window.location.href = "feed.html";
        } catch (error) {
            alert(error.message);
        }
    } else {
        // Login Logic
        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = "feed.html";
        } catch (error) {
            alert("Invalid credentials");
        }
    }
});

// Google Sign-in
document.getElementById('google-btn').addEventListener('click', async () => {
    try {
        await signInWithPopup(auth, googleProvider);
        window.location.href = "feed.html";
    } catch (error) {
        console.error(error);
    }
});
