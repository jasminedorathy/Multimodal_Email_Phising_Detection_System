document.getElementById('analyze-btn').addEventListener('click', async () => {
    const btn = document.getElementById('analyze-btn');
    const resultBox = document.getElementById('result-box');
    
    btn.innerHTML = '<span class="loader"></span> Scanning...';
    btn.disabled = true;
    resultBox.style.display = 'none';

    // Get current tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        let activeTab = tabs[0];
        
        // Execute content script to scrape text
        chrome.scripting.executeScript({
            target: {tabId: activeTab.id},
            function: getPageContent
        }, async (injectionResults) => {
            let pageText = "";
            for (const frameResult of injectionResults) {
                pageText += frameResult.result + " ";
            }
            
            // Limit text size
            if(pageText.length > 5000) pageText = pageText.substring(0, 5000);
            
            // Build Form Data for our API
            const formData = new URLSearchParams();
            formData.append('text', pageText);
            formData.append('urls', JSON.stringify([activeTab.url]));
            
            try {
                // Call local PhishGuard API
                const res = await fetch('http://127.0.0.1:5000/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData.toString()
                });
                
                const data = await res.json();
                
                // Show Results
                resultBox.style.display = 'block';
                resultBox.className = data.prediction === 'phishing' ? 'phishing' : 'safe';
                
                document.getElementById('verdict').innerText = data.prediction === 'phishing' ? '⚠️ MALICIOUS' : '✅ SAFE';
                document.getElementById('conf').innerText = (data.confidence * 100).toFixed(1) + '%';
                
                document.getElementById('s-url').innerText = (data.url_score * 100).toFixed(0);
                document.getElementById('s-text').innerText = (data.text_score * 100).toFixed(0);
                document.getElementById('s-per').innerText = (data.persuasion_score * 100).toFixed(0);
                
                if (data.prediction === 'phishing') {
                    btn.style.display = 'none'; // remove button, show alert
                    chrome.tabs.sendMessage(activeTab.id, {action: "blockPage"});
                }
            } catch (err) {
                alert('Failed to connect to PhishGuard API. Is localhost:5000 running?');
            } finally {
                btn.innerHTML = 'Scan Current Tab';
                btn.disabled = false;
            }
        });
    });
});

// Function injected into the page
function getPageContent() {
    return document.body.innerText;
}
