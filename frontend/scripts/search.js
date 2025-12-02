/* The reserch lgic
  Handles: arXiv (XML), GitHub (JSON), StackOverflow (JSON)
*/

//  DOM elements
const keywordInput = document.getElementById('keyword');
const resourceType = document.getElementById('resource-type');
const searchBtn = document.getElementById('search-btn');
const resultsContainer = document.getElementById('results-container');

//  Event listener
searchBtn.addEventListener('click', async () => {
    const query = keywordInput.value.trim();
    const type = resourceType.value;

    // Validate and ensure inputs are not empty
    if (!query) {
        alert("Please enter a keyword to search!");
        return;
    }
    if (!type) {
        alert("Please select a resource type!");
        return;
    }

    // Show the loading state
    resultsContainer.innerHTML = `<p style="text-align:center; color:#666;">Searching ${type} for "<strong>${query}</strong>"...</p>`;

    // Router and decide which API to call
    try {
        if (type === 'arxiv') {
            await fetchArxiv(query);
        } else if (type === 'github') {
            await fetchGithub(query);
        } else if (type === 'stackoverflow') {
            await fetchStackOverflow(query);
        }
    } catch (error) {
        resultsContainer.innerHTML = `<p style="text-align:center; color:red;">Something went wrong. Please try again later.</p>`;
        console.error(error);
    }
});


// Display functions and creates the UI cards

function createCard(title, link, description, source) {
    let badgeColor = '#333'; 
    if(source === 'arXiv') badgeColor = '#f48024'; 
    if(source === 'GitHub') badgeColor = '#f48024'; 
    if(source === 'StackOverflow') badgeColor = '#f48024'; 

    return `
        <div style="background: white; padding: 20px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); border-left: 5px solid ${badgeColor}; text-align: left;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <h3 style="margin: 0 0 10px 0; font-size: 1.1rem;">
                    <a href="${link}" target="_blank" style="text-decoration: none; color: #333; font-weight: 700;">${title}</a>
                </h3>
                <span style="background:${badgeColor}; color:white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">${source}</span>
            </div>
            <p style="color: #555; font-size: 0.95rem; line-height: 1.5;">${description}</p>
            <a href="${link}" target="_blank" style="color: ${badgeColor}; font-size: 0.85rem; text-decoration: underline; margin-top: 10px; display: inline-block;">View Resource &rarr;</a>
        </div>
    `;
}


// The API fetch function


// --- A. arXiv API (XML Data) ---
// async function fetchArxiv(query) {
//     // API: http://export.arxiv.org/api/query
//     const url = `http://export.arxiv.org/api/query?search_query=all:${query}&start=0&max_results=5`;

//     const response = await fetch(url);
//     const str = await response.text(); // arXiv returns XML, not JSON
//     const data = new window.DOMParser().parseFromString(str, "text/xml");
    
//     const entries = data.querySelectorAll("entry");
//     let html = "";

//     if (entries.length === 0) {
//         resultsContainer.innerHTML = "<p>No papers found.</p>";
//         return;
//     }

//     entries.forEach(entry => {
//         const title = entry.querySelector("title").textContent;
//         const summary = entry.querySelector("summary").textContent.slice(0, 200) + "..."; // Cut summary short
//         const link = entry.querySelector("id").textContent;
//         html += createCard(title, link, summary, "arXiv");
//     });

//     resultsContainer.innerHTML = html;
// }

// The arXiv API (XML Data) 
async function fetchArxiv(query) {
    // 1. We define the target URL (changed http to https)
    const targetUrl = `https://export.arxiv.org/api/query?search_query=all:${query}&start=0&max_results=5`;
    
    // 2. We wrap it in a CORS proxy to bypass browser security blocks
    // This proxy (AllOrigins) fetches the data for us and sends it back safely.
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const str = await response.text(); 
        
        // 3. Parse XML to workable data
        const data = new window.DOMParser().parseFromString(str, "text/xml");
        const entries = data.querySelectorAll("entry");
        
        let html = "";

        // Check if no entries were found
        if (entries.length === 0) {
            resultsContainer.innerHTML = "<p>No arXiv papers found for this keyword.</p>";
            return;
        }

        entries.forEach(entry => {
            // Use try-catch inside loop to prevent one bad entry from breaking everything
            try {
                const title = entry.querySelector("title").textContent;
                // Clean up the summary (it often has newlines) and cut it
                const rawSummary = entry.querySelector("summary").textContent;
                const summary = rawSummary.replace(/\n/g, " ").slice(0, 200) + "..."; 
                const link = entry.querySelector("id").textContent;
                
                html += createCard(title, link, summary, "arXiv");
            } catch (err) {
                console.warn("Skipped a malformed arXiv entry", err);
            }
        });

        resultsContainer.innerHTML = html;
        saveResultsToStorage(html, query, 'arXiv');

    } catch (error) {
        console.error("ArXiv Fetch Error:", error);
        resultsContainer.innerHTML = `<p style="text-align:center; color:red;">
            Error fetching arXiv data. Please check your internet connection. <br>
            <small>${error.message}</small>
        </p>`;
    }
}
// --- B. GitHub API (JSON Data) ---
async function fetchGithub(query) {
    // API: https://api.github.com/search/repositories
    const url = `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=5`;

    const response = await fetch(url);
    const data = await response.json();
    let html = "";

    if (!data.items || data.items.length === 0) {
        resultsContainer.innerHTML = "<p>No repositories found.</p>";
        return;
    }

    data.items.forEach(item => {
        const title = item.full_name; // e.g., "facebook/react"
        const link = item.html_url;
        const description = item.description ? item.description : "No description available.";
        const stars = ` ${item.stargazers_count} stars`;
        
        // Combine desc + stars for the card
        html += createCard(title, link, `${description} <br> <strong>${stars}</strong>`, "GitHub");
    });

    resultsContainer.innerHTML = html;
    saveResultsToStorage(html, query, 'GitHub');
}

// --- C. StackOverflow API (JSON Data) ---
async function fetchStackOverflow(query) {
    // API: https://api.stackexchange.com/2.3/search
    const url = `https://api.stackexchange.com/2.3/search?order=desc&sort=relevance&intitle=${query}&site=stackoverflow`;

    const response = await fetch(url);
    const data = await response.json();
    let html = "";

    if (!data.items || data.items.length === 0) {
        resultsContainer.innerHTML = "<p>No discussions found.</p>";
        return;
    }

    data.items.slice(0, 5).forEach(item => {
        const title = item.title; // Note: Contains HTML entities sometimes
        const link = item.link;
        const tags = item.tags.join(", ");
        const description = `Tags: ${tags} | Answered: ${item.is_answered ? "Yes" : "No"}`;
        
        html += createCard(title, link, description, "StackOverflow");
    });

    resultsContainer.innerHTML = html;
    saveResultsToStorage(html, query, 'StackOverflow');
}


// Helper: Save current results to LocalStorage
function saveResultsToStorage(htmlContent, query, type) {
    const dataToSave = {
        html: htmlContent,
        query: query,
        type: type,
        timestamp: new Date().getTime() // Optional: could be used to expire old data
    };
    // Convert the object to a JSON string and save it
    localStorage.setItem('lastSearchResult', JSON.stringify(dataToSave));
}


// 6. ON PAGE LOAD: RESTORE DATA

window.addEventListener('DOMContentLoaded', () => {
    // Check if we have saved data
    const savedData = localStorage.getItem('lastSearchResult');

    if (savedData) {
        // Parse the JSON string back into an object
        const parsedData = JSON.parse(savedData);

        // Restore the input values so the user sees what they last searched
        keywordInput.value = parsedData.query;
        resourceType.value = parsedData.type === 'GitHub' ? 'github' : 
                             parsedData.type === 'arXiv' ? 'arxiv' : 'stackoverflow';

        // Restore the results
        resultsContainer.innerHTML = parsedData.html;
        
        // Optional: Add a small note saying this is cached
        const note = document.createElement('p');
        note.style.textAlign = "center";
        note.style.fontSize = "0.8rem";
        note.style.color = "#888";
        note.innerText = "Restored from your last session";
        resultsContainer.insertBefore(note, resultsContainer.firstChild);
    }
});