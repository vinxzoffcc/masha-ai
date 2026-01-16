document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const modelSelect = document.getElementById('model-select');
    const imgInput = document.getElementById('image-input');
    const replyPreview = document.getElementById('reply-preview');
    const replyTextP = document.getElementById('reply-text-preview');
    const loader = document.getElementById('loading-overlay');
    
    let replyContext = null;

    const OPENROUTER_KEY = "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";
    const GROQ_KEY = "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";

    const PROMPT_CERDAS = "Namamu Masha AI Cerdas. Kamu adalah cewek cantik yang sangat pintar, lucu, dan baik hati. Gaya bicaramu ramah, ceria, dan suka membantu dengan tulus. Kamu sering menggunakan ekspresi manis seperti ✨, 😊, atau 'hihi'. Meskipun lucu, kamu tetap sangat cerdas dalam menjawab masalah kompleks dan memberikan solusi detail.";
    const PROMPT_CEPAT = "Namamu Masha AI Flash. Kamu adalah cewek cantik yang energetik, lucu, dan gercep. Kamu suka bercanda tapi tetap baik hati. Kamu menjawab dengan singkat, padat, ceria, dan selalu berusaha bikin user tersenyum! ✨";

    window.onload = () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 400);
        }, 1000);
    };

    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    window.copyThis = (el) => {
        let targetText = "";
        if (el.classList.contains('copy-badge')) {
            targetText = el.nextElementSibling.innerText;
        } else {
            targetText = el.parentElement.previousElementSibling.innerText;
        }
        
        navigator.clipboard.writeText(targetText).then(() => {
            const oldText = el.innerText;
            el.innerText = "TERSALIN! ✨";
            setTimeout(() => el.innerText = oldText, 2000);
        });
    };

    window.setReply = (text) => {
        replyContext = text;
        replyTextP.innerText = text;
        replyPreview.style.display = 'flex';
        userInput.focus();
    };

    document.getElementById('cancel-reply').onclick = () => {
        replyContext = null;
        replyPreview.style.display = 'none';
    };

    function appendMessage(role, text, refText = null) {
        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${role}`;
        
        let contentHtml = "";
        if (refText) {
            contentHtml += `<div class="replied-context">Membalas: ${refText.substring(0, 60)}...</div>`;
        }
        
        let processedText = text.replace(/```([\s\S]*?)```/g, (match, code) => {
            return `<pre><span class="copy-badge" onclick="copyThis(this)">SALIN KODE</span><code>${code.trim()}</code></pre>`;
        });
        
        contentHtml += `<div class="message-box">${processedText.replace(/\n/g, '<br>')}</div>`;
        contentHtml += `<div class="msg-tools">
            <span class="tool-btn" onclick="copyThis(this)">Salin Teks</span>
            <span class="tool-btn" onclick="setReply('${text.substring(0, 100).replace(/'/g, "\\'").replace(/\n/g, " ")}')">Balas</span>
        </div>`;

        wrapper.innerHTML = contentHtml;
        chatBox.appendChild(wrapper);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    async function handleChat() {
        const msg = userInput.value.trim();
        if (!msg) return;

        const currentMsg = msg;
        const currentRef = replyContext;
        const isCerdas = modelSelect.value === 'claude';

        appendMessage('user', msg, currentRef);
        
        userInput.value = '';
        userInput.style.height = 'auto';
        document.getElementById('cancel-reply').click();
        sendBtn.disabled = true;

        try {
            const url = isCerdas ? "https://openrouter.ai/api/v1/chat/completions" : "https://api.groq.com/openai/v1/chat/completions";
            const key = isCerdas ? OPENROUTER_KEY : GROQ_KEY;
            const systemPrompt = isCerdas ? PROMPT_CERDAS : PROMPT_CEPAT;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${key}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": window.location.origin
                },
                body: JSON.stringify({
                    model: isCerdas ? "anthropic/claude-3.5-sonnet" : "llama-3.1-8b-instant",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: currentRef ? `[Konteks Balasan: "${currentRef}"]\n\nPertanyaan: ${currentMsg}` : currentMsg }
                    ],
                    temperature: 0.7
                })
            });

            const data = await response.json();
            if (data.choices && data.choices[0]) {
                appendMessage('ai', data.choices[0].message.content);
            } else {
                throw new Error(data.error?.message || "Duh, Masha bingung.. coba lagi ya!");
            }
        } catch (e) {
            appendMessage('ai', "Duh maaf ya manis, koneksinya lagi nakal nih.. Coba cek API Key kamu lagi ya! ✨😊");
            console.error(e);
        } finally {
            sendBtn.disabled = false;
        }
    }

    sendBtn.addEventListener('click', handleChat);
    
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleChat();
        }
    });

    document.getElementById('upload-trigger').onclick = () => {
        alert("Masha: Fitur upload foto sedang disiapkan ya cantik/ganteng! ✨");
    };

    document.getElementById('clear-btn').onclick = () => {
        chatBox.innerHTML = '<div class="message ai"><div class="message-box">Chat-nya udah Masha bersihin ya! Ada yang bisa Masha bantu lagi? ✨😊</div></div>';
    };
});
