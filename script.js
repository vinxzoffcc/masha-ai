document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const modelSelect = document.getElementById('model-select');
    const clearBtn = document.getElementById('clear-btn');
    const loader = document.getElementById('loading-overlay');

    const geminiApiKey = "AIzaSyDuSIb7-dCDw8J2qi5x8GTID7v15tjXjpI";
    const groqApiKey = "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";

    const PROMPT_GEMINI = "Namamu adalah Masha Pintar. Jawab dengan bijaksana dan detail.";
    const PROMPT_GROQ = "Namamu adalah Masha Cepat. Jawab dengan singkat dan energetik.";

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
                contents: [{ parts: [{ text: `${PROMPT_GEMINI}\n\nUser: ${message}` }] }]
            })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Gemini Error");
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
        if (!response.ok) throw new Error(data.error?.message || "Groq Error");
        return data.choices[0].message.content;
    }

    async function handleChat() {
        const msg = userInput.value.trim();
        if (!msg) return;

        appendMessage('user', msg);
        userInput.value = '';
        sendBtn.disabled = true;

        try {
            const reply = modelSelect.value === 'gemini' ? await callGemini(msg) : await callGroq(msg);
            appendMessage('ai', reply);
        } catch (e) {
            console.error(e);
            appendMessage('ai', `Error: ${e.message}`);
        } finally {
            sendBtn.disabled = false;
        }
    }

    sendBtn.addEventListener('click', handleChat);
    userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChat(); });
    clearBtn.addEventListener('click', () => { chatBox.innerHTML = ''; });
});
