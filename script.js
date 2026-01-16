document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const modelSelect = document.getElementById('model-select');
    const clearBtn = document.getElementById('clear-btn');
    const loader = document.getElementById('loading-overlay');
    const imgInput = document.getElementById('image-input');
    const uploadTrigger = document.getElementById('upload-trigger');
    const previewContainer = document.getElementById('preview-container');
    const imgPreview = document.getElementById('img-preview');
    const removeImg = document.getElementById('remove-img');
    
    let base64Image = null;

    const OPENROUTER_KEY = "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";
    const GROQ_KEY = "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";

    const PROMPT_PINTAR = "Namamu adalah Masha Pintar. Kamu adalah ahli analisis kode dan error. Jika user mengirim gambar, teliti setiap baris kode/error di gambar tersebut, jelaskan penyebabnya, dan berikan perbaikan kode yang benar dalam blok JSON atau Code.";
    const PROMPT_CEPAT = "Namamu adalah Masha Cepat. Kamu adalah asisten chat yang sangat responsif, ceria, dan membantu segala pertanyaan umum dengan singkat dan padat.";

    window.onload = () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 400);
        }, 1000);
    };

    uploadTrigger.addEventListener('click', () => imgInput.click());

    imgInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                base64Image = event.target.result;
                imgPreview.src = base64Image;
                previewContainer.style.display = 'inline-block';
            };
            reader.readAsDataURL(file);
        }
    });

    removeImg.addEventListener('click', () => {
        base64Image = null;
        imgInput.value = "";
        previewContainer.style.display = 'none';
    });

    function appendMessage(role, text, isImage = false) {
        const div = document.createElement('div');
        div.className = `message ${role}`;
        
        if (isImage) {
            div.innerHTML = `<img src="${text}" class="ai-img">`;
        } else if (text.includes('```')) {
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
        const selectedModel = modelSelect.value;
        if (!msg && !base64Image) return;

        if (base64Image) appendMessage('user', base64Image, true);
        if (msg) appendMessage('user', msg);

        const currentImg = base64Image;
        userInput.value = '';
        removeImg.click();
        sendBtn.disabled = true;

        try {
            let apiUrl, apiKey, body;

            if (selectedModel === 'openrouter') {
                apiUrl = "https://openrouter.ai/api/v1/chat/completions";
                apiKey = OPENROUTER_KEY;
                
                const userContent = [{ type: "text", text: msg || "Tolong analisis gambar ini." }];
                if (currentImg) userContent.push({ type: "image_url", image_url: { url: currentImg } });

                body = {
                    model: "google/gemini-pro-1.5-exp",
                    messages: [
                        { role: "system", content: PROMPT_PINTAR },
                        { role: "user", content: userContent }
                    ]
                };
            } else {
                apiUrl = "https://api.groq.com/openai/v1/chat/completions";
                apiKey = GROQ_KEY;
                body = {
                    model: "llama-3.1-8b-instant",
                    messages: [
                        { role: "system", content: PROMPT_CEPAT },
                        { role: "user", content: msg }
                    ]
                };
            }

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": window.location.href, 
                    "X-Title": "Masha AI"
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            if (data.choices && data.choices[0]) {
                appendMessage('ai', data.choices[0].message.content);
            } else {
                throw new Error(data.error?.message || "User Not Found / API Key Error");
            }
        } catch (e) {
            appendMessage('ai', `Error: ${e.message}`);
        } finally {
            sendBtn.disabled = false;
        }
    }

    sendBtn.addEventListener('click', handleChat);
    userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChat(); });
    clearBtn.addEventListener('click', () => { chatBox.innerHTML = ''; });
});
