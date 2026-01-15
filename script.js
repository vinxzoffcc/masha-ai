document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const modelSelect = document.getElementById('model-select');
    const clearBtn = document.getElementById('clear-btn');
    const loader = document.getElementById('loading-overlay');

    const SYSTEM_PROMPT = "Namamu adalah Masha, asisten AI yang ceria, pintar, dan membantu. Kamu selalu menjawab dengan bahasa Indonesia yang santai tapi sopan.";

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

    async function handleChat() {
        const msg = userInput.value.trim();
        if (!msg) return;

        appendMessage('user', msg);
        userInput.value = '';
        sendBtn.disabled = true;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: SYSTEM_PROMPT,
                    message: msg,
                    model: modelSelect.value
                })
            });
            const data = await response.json();
            appendMessage('ai', data.reply);
        } catch (e) {
            appendMessage('ai', "Maaf, Masha sedang lelah. Coba lagi nanti ya!");
        } finally {
            sendBtn.disabled = false;
        }
    }

    sendBtn.addEventListener('click', handleChat);
    userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChat(); });
    clearBtn.addEventListener('click', () => {
        chatBox.innerHTML = '<div class="message ai">Chat dibersihkan! Ada lagi yang bisa Masha bantu?</div>';
    });
});
