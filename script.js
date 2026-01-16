document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const replyPreview = document.getElementById('reply-preview');
    const replyTextP = document.getElementById('reply-text-preview');
    const loader = document.getElementById('loading-overlay');
    
    let activeModel = 'claude';
    let replyContext = null;

    // --- DATABASE & HISTORY LOGIC ---
    let userData = JSON.parse(localStorage.getItem('masha_user')) || { 
        name: "User-" + Math.floor(Math.random()*1000), 
        history: [] 
    };

    const saveChat = (role, text, ref = null) => {
        userData.history.push({ role, text, ref });
        localStorage.setItem('masha_user', JSON.stringify(userData));
    };

    const loadHistory = () => {
        document.getElementById('user-display-name').innerText = userData.name;
        if (userData.history.length > 0) {
            userData.history.forEach(chat => {
                renderMessage(chat.role, chat.text, chat.ref, false);
            });
        } else {
            renderMessage('ai', "Eh halo! Belum ada chat ya? Yuk sapa Masha! ✨", null, false);
        }
    };
    // --------------------------------

    const OPENROUTER_KEY = "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";
    const GROQ_KEY = "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";

    const PROMPT = "Kamu Masha, cewek asik yang cantik dan pinter bgt. Gaya bahasa kamu santai, pake 'aku-kamu', sering pake kata 'eh', 'ih', 'wkwk', atau 'gemes'. Kamu baik bgt tapi tetep jenius. Jangan kaku kayak robot, bicaralah seperti teman dekat yang perhatian.";

    window.onload = () => {
        loadHistory(); // Panggil history saat buka web
        setTimeout(() => loader.style.display = 'none', 1500);
    };

    function renderMessage(role, text, ref = null, isNew = true) {
        const wrap = document.createElement('div');
        wrap.className = `msg-wrapper ${role}`;
        
        let html = "";
        if (ref) html += `<div style="font-size:10px; opacity:0.5; margin-bottom:4px;">↩️ ${ref.substring(0,30)}...</div>`;
        html += `<div class="msg-box">${text.replace(/\n/g, '<br>')}</div>`;
        
        wrap.innerHTML = html;

        // Swipe Interaction
        let touchStartX = 0;
        wrap.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX);
        wrap.addEventListener('touchend', e => {
            let move = e.changedTouches[0].clientX - touchStartX;
            if (move > 60) setReply(text);
        });

        chatBox.appendChild(wrap);
        chatBox.scrollTop = chatBox.scrollHeight;

        if (isNew) saveChat(role, text, ref); // Simpan ke database jika pesan baru
    }

    function setReply(text) {
        replyContext = text;
        replyTextP.innerText = text;
        replyPreview.style.display = 'flex';
        userInput.focus();
    }

    document.getElementById('cancel-reply').onclick = () => {
        replyContext = null;
        replyPreview.style.display = 'none';
    };

    document.querySelectorAll('.m-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelector('.m-btn.active').classList.remove('active');
            btn.classList.add('active');
            activeModel = btn.dataset.val;
        };
    });

    async function handleChat() {
        const msg = userInput.value.trim();
        if (!msg) return;

        const currentRef = replyContext;
        renderMessage('user', msg, currentRef, true);
        
        userInput.value = '';
        document.getElementById('cancel-reply').click();
        sendBtn.disabled = true;

        try {
            const isClaude = activeModel === 'claude';
            const url = isClaude ? "https://openrouter.ai/api/v1/chat/completions" : "https://api.groq.com/openai/v1/chat/completions";
            const key = isClaude ? OPENROUTER_KEY : GROQ_KEY;

            const response = await fetch(url, {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${key}`, 
                    "Content-Type": "application/json",
                    "HTTP-Referer": window.location.origin 
                },
                body: JSON.stringify({
                    model: isClaude ? "anthropic/claude-3.5-sonnet" : "llama-3.1-8b-instant",
                    messages: [
                        { role: "system", content: PROMPT },
                        { role: "user", content: currentRef ? `(Membalas: "${currentRef}")\n${msg}` : msg }
                    ]
                })
            });

            const data = await response.json();
            const aiReply = data.choices[0].message.content;
            renderMessage('ai', aiReply, null, true);
        } catch (e) {
            renderMessage('ai', "Aduh, otak aku lagi loading nih.. bentar ya manis! ✨", null, false);
        } finally {
            sendBtn.disabled = false;
        }
    }

    sendBtn.onclick = handleChat;
    userInput.onkeydown = e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat(); } };
    
    // Fitur hapus database
    document.getElementById('clear-btn').onclick = () => {
        if(confirm("Hapus semua memori chat kita? 🥺")) {
            userData.history = [];
            localStorage.setItem('masha_user', JSON.stringify(userData));
            chatBox.innerHTML = '';
            renderMessage('ai', "Memori dihapus.. Yuk mulai obrolan baru! ✨", null, false);
        }
    };
});
