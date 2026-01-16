document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const modelSelect = document.getElementById('model-select');
    const clearBtn = document.getElementById('clear-btn');
    const loader = document.getElementById('loading-overlay');
    
    const OPENROUTER_KEY = "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";
    const GROQ_KEY = "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";

    window.onload = () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 400);
        }, 1000);
    };

    function appendMessage(role, text) {
        const div = document.createElement('div');
        div.className = `message ${role}`;
        
        if (text.includes('```')) {
            const parts = text.split('```');
            let html = "";
            parts.forEach((part, index) => {
                if (index % 2 === 1) {
                    const code = part.replace(/^(json|javascript|html|css|python|sql)/, '').trim();
                    html += `<pre><code>${code}</code><button class="copy-code-btn" onclick="copyCode(this)">Copy</button></pre>`;
                } else {
                    html += part.replace(/\n/g, '<br>');
                }
            });
            div.innerHTML = html;
        } else if (text.match(/\.(jpeg|jpg|gif|png|webp)/i)) {
            const urlMatch = text.match(/https?:\/\/[^\s]+/i);
            if (urlMatch) {
                const url = urlMatch[0];
                div.innerHTML = `${text.replace(url, '')}<br><img src="${url}" class="ai-img"><br><a href="${url}" download target="_blank" class="download-btn">Download Image</a>`;
            } else {
                div.innerText = text;
            }
        } else {
            div.innerHTML = text.replace(/\n/g, '<br>');
        }

        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    window.copyCode = (btn) => {
        const code = btn.previousSibling.innerText;
        navigator.clipboard.writeText(code);
        btn.innerText = "Copied!";
        setTimeout(() => btn.innerText = "Copy", 2000);
    };

    async function handleChat() {
        const msg = userInput.value.trim();
        if (!msg) return;

        appendMessage('user', msg);
        userInput.value = '';
        sendBtn.disabled = true;

        try {
            let response;
            if (modelSelect.value === 'smart') {
                response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${OPENROUTER_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "model": "mistralai/mistral-large",
                        "messages": [
                            {"role": "system", "content": "Namamu Masha Pintar. Kamu AI jenius yang cerdas dan detail."},
                            {"role": "user", "content": msg}
                        ]
                    })
                });
            } else {
                response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${GROQ_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "model": "llama-3.1-8b-instant",
                        "messages": [
                            {"role": "system", "content": "Namamu Masha Cepat. Kamu AI yang energetik, singkat, dan sangat cepat."},
                            {"role": "user", "content": msg}
                        ]
                    })
                });
            }

            const data = await response.json();
            if (data.choices && data.choices[0]) {
                appendMessage('ai', data.choices[0].message.content);
            } else {
                throw new Error(data.error?.message || "Invalid Response");
            }
        } catch (e) {
            appendMessage('ai', `Error: ${e.message}`);
        } finally {
            sendBtn.disabled = false;
        }
    }

    sendBtn.addEventListener('click', handleChat);
    userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChat(); });
    clearBtn.addEventListener('click', () => {
        chatBox.innerHTML = '<div class="message ai">Memory cleared! Masha siap membantu lagi. ✨</div>';
    });
});
