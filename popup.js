document.addEventListener('DOMContentLoaded', () => {
  const cardImage = document.getElementById('og-image');
  const cardTitle = document.getElementById('og-title');
  const cardDesc = document.getElementById('og-desc');
  const cardFavicon = document.getElementById('favicon');
  const cardDomain = document.getElementById('domain');
  const draftBtn = document.getElementById('draft-btn');
  const toast = document.getElementById('toast');

  let currentData = {};

  // 1. Inject content script into active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;

    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }, (results) => {
      if (results && results[0] && results[0].result) {
        currentData = results[0].result;
        renderPreview(currentData);
      }
    });
  });

  // 2. Render the Preview in the Extension Popup
  function renderPreview(data) {
    cardTitle.textContent = data.title;
    cardDesc.textContent = data.description;
    cardDomain.textContent = data.hostname;
    
    // Handle Image
    if (data.image) {
      cardImage.src = data.image;
    } else {
      // Fallback if no image found
      cardImage.style.display = 'none'; 
      cardImage.parentElement.innerHTML = '<span style="color:#999; font-size:12px;">No Image Found</span>';
    }

    // Handle Favicon
    if (data.favicon) {
      cardFavicon.src = data.favicon;
    } else {
      cardFavicon.style.display = 'none';
    }
  }

  // 3. Button Click: Copy HTML and Open Gmail
  draftBtn.addEventListener('click', async () => {
    // A. Generate Email-Safe HTML (Inline Styles)
    const htmlBlob = createEmailHTML(currentData);
    
    // B. Write to Clipboard as text/html
    try {
      const type = "text/html";
      const blob = new Blob([htmlBlob], { type });
      const data = [new ClipboardItem({ [type]: blob })];
      await navigator.clipboard.write(data);
      
      // C. Show Success Message
      toast.classList.remove('hidden');

      // D. Open Gmail
      const subject = encodeURIComponent(`Check this out: ${currentData.title}`);
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}`;
      chrome.tabs.create({ url: gmailUrl });

    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.textContent = "Error copying. Try again.";
      toast.classList.remove('hidden');
    }
  });

  // Helper: Generates the "Large Hero" HTML string with inline CSS
  // This is what actually gets pasted into Gmail.
  function createEmailHTML(data) {
    const imageUrl = data.image ? data.image : '';
    const link = data.url;

    return `
      <div style="font-family: Arial, sans-serif; max-width: 450px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 20px;">
        <a href="${link}" style="text-decoration: none; color: inherit; display: block;">
          
          ${imageUrl ? `<div style="width: 100%; height: 220px; background-image: url('${imageUrl}'); background-size: cover; background-position: center; background-color: #f3f4f6;"></div>` : ''}
          
          <div style="padding: 16px; background-color: #ffffff;">
            <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #111827; line-height: 1.4; font-weight: bold;">
              ${data.title}
            </h3>
            <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; line-height: 1.5;">
              ${data.description}
            </p>
            <div style="font-size: 12px; color: #9ca3af; text-transform: uppercase; font-weight: bold; border-top: 1px solid #f3f4f6; padding-top: 8px;">
              ${data.hostname}
            </div>
          </div>
        </a>
      </div>
      <p style="font-size: 12px; color: #999;">Original Link: <a href="${link}">${link}</a></p>
    `;
  }
});