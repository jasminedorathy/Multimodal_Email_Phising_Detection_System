chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "blockPage") {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(239, 68, 68, 0.95)';
        overlay.style.color = 'white';
        overlay.style.zIndex = '999999999';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.fontFamily = 'sans-serif';
        
        overlay.innerHTML = `
            <h1 style="font-size: 48px; margin-bottom: 20px;">⚠️ STOP - Phishing Detected</h1>
            <p style="font-size: 24px;">PhishGuard has determined this page is malicious.</p>
            <button id="pg-go-back" style="margin-top: 30px; padding: 15px 30px; font-size: 20px; background: white; color: #ef4444; border: none; border-radius: 8px; cursor: pointer;">Go Back to Safety</button>
        `;
        
        document.body.appendChild(overlay);
        
        document.getElementById('pg-go-back').addEventListener('click', () => {
            window.history.back();
        });
    }
});
