const prompt = document.querySelector("#prompt");
const submitBtn = document.querySelector("#submit");
const chatContainer = document.querySelector(".chat-container");
const imageBtn = document.querySelector("#image");
const image = document.querySelector("#image img");
const imageInput = document.querySelector("#image input");

const GALLERY_ICON = "./img/img.svg";

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAitF8FwN8P7NkORwwsTf1Sl5CPUWOd7Kk";

let user = {
    message: "",
    file: {
        mime_type: null,
        data: null
    }
};

// 🧱 Create chat box
function createChatBox(html, className) {
    const div = document.createElement("div");
    div.className = className;
    div.innerHTML = html;
    return div;
}

// 🧠 Main Chat Handler
function handleChat() {
    if (!prompt.value.trim() && !user.file.data) return;

    user.message = prompt.value;
    prompt.value = "";

    const userHTML = `
        <img src="./assets/user.png" width="8%">
        <div class="user-chat-area">
            ${user.message}
            ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg">` : ""}
        </div>
    `;

    chatContainer.appendChild(createChatBox(userHTML, "user-chat-box"));
    scrollDown();

    setTimeout(() => {
        const aiHTML = `
            <img src="./assets/ai.png" width="10%">
            <div class="ai-chat-area">
                <img src="./img/loading.gif" width="50">
            </div>
        `;
        const aiBox = createChatBox(aiHTML, "ai-chat-box");
        chatContainer.appendChild(aiBox);
        scrollDown();
        generateResponse(aiBox);
    }, 600);
}

// 🌐 API Response
async function generateResponse(aiBox) {
    const textArea = aiBox.querySelector(".ai-chat-area");

    const body = {
        contents: [{
            parts: [
                { text: user.message },
                ...(user.file.data ? [{ inline_data: user.file }] : [])
            ]
        }]
    };

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        const reply = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();

        textArea.innerHTML = reply;
    }
    catch (err) {
        console.error(err);
        textArea.innerHTML = "⚠️ Error generating response";
    }
    finally {
        resetImage();
        scrollDown();
    }
}

// 🧹 Reset image button
function resetImage() {
    image.src = GALLERY_ICON;
    image.classList.remove("choose");
    imageInput.value = "";
    user.file = { mime_type: null, data: null };
}

// 📜 Scroll helper
function scrollDown() {
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
}

// 🧾 Input handlers
prompt.addEventListener("keydown", e => {
    if (e.key === "Enter") handleChat();
});

submitBtn.addEventListener("click", handleChat);

// 🖼 Image input
imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        const base64 = e.target.result.split(",")[1];
        user.file = { mime_type: file.type, data: base64 };

        image.src = e.target.result;
        image.classList.add("choose");
    };
    reader.readAsDataURL(file);
});

// 🧷 Image button click
imageBtn.addEventListener("click", () => imageInput.click());
