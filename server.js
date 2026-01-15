const express = require('express');
const app = express();
app.use(express.json());

const CONFIG = {
    geminiKey: "AIzaSyDq-e9kewD6rGVyrZfdjLZC7J1n74X1uf8",
    groqKey: "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"
};

app.post('/api/chat', async (req, res) => {
    const { prompt, message, model } = req.body;
    
    try {
        let aiResponse = "";
        if (model === 'gemini') {
            aiResponse = "[Masha Pintar] Halo! Ini jawaban dari Masha berdasarkan prompt Masha.";
        } else {
            aiResponse = "[Masha Cepat] Hai! Ini respon cepat dari Masha untukmu.";
        }
        res.json({ reply: aiResponse });
    } catch (err) {
        res.status(500).json({ error: "System Error" });
    }
});

app.listen(3000);
