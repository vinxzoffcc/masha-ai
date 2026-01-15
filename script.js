document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const modelSelect = document.getElementById('model-select');
    const clearBtn = document.getElementById('clear-btn');
    const loader = document.getElementById('loading-overlay');

    const geminiApiKey = "AIzaSyBEATnYdqZ01W7oJiOr_PFqWOdanHPAIQY";
    const groqApiKey = "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";

    const PROMPT_GEMINI = "Namamu adalah Masha Pintar. Kamu adalah AI yang sangat bijaksana, detail, dan puitis dalam menjawab. Kamu menggunakan bahasa Indonesia yang sangat rapi.";
    const PROMPT_GROQ = "Namamu adalah Masha Cepat. Kamu adalah AI yang singkat, padat, to-the-point, dan sangat energetik. Kamu menjawab dengan cepat dan gaul.";

    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 400);
        }, 1000);
    });

    function appendMessage(role, text) {
        const div = document.createElement('div');
        div.className = `message ${role}`;
        div.innerText = text;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    async function callGemini(message) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `${PROMPT_GEMINI}\n\nPertanyaan user: ${message}` }]
                }]
            })
        });
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    async function callGroq(message) {
        const url = "https://api.groq.com/openai/v1/chat/completions";
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${groqApiKey}`
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: PROMPT_GROQ },
                    { role: "user", content: message }
                ]
            })
        });
        const data = await response.json();
        return data.choices[0].message.content;
    }

    async function handleChat() {
        const msg = userInput.value.trim();
        if (!msg) return;

        const selectedModel = modelSelect.value;
        appendMessage('user', msg);
        userInput.value = '';
        sendBtn.disabled = true;

        try {
            let reply = "";
            if (selectedModel === 'gemini') {
                reply = await callGemini(msg);
            } else {
                reply = await callGroq(msg);
            }
            appendMessage('ai', reply);
        } catch (e) {
            console.error(e);
            appendMessage('ai', "Waduh, koneksi Masha lagi bermasalah nih. Coba cek API Key atau internet kamu ya!");
        } finally {
            sendBtn.disabled = false;
        }
    }

    sendBtn.addEventListener('click', handleChat);
    userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChat(); });
    clearBtn.addEventListener('click', () => {
        chatBox.innerHTML = '<div class="message ai">Riwayat chat dihapus! Masha siap mulai dari awal. ✨</div>';
    });
});
