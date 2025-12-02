/* The reserch logic
 This handles these APIs arXiv (XML), GitHub (JSON), StackOverflow (JSON)
*/

//  The DOM elements
const keywordInput = document.getElementById('keyword');
const resourceType = document.getElementById('resource-type');
const searchBtn = document.getElementById('search-btn');
const resultsContainer = document.getElementById('results-container');

//  The Event listener
searchBtn.addEventListener('click', async () => {
    const query = keywordInput.value.trim();
    const type = resourceType.value;

    // This validate and ensure inputs are not empty
    if (!query) {
        alert("Please enter a keyword to search!");
        return;
    }
    if (!type) {
        alert("Please select a resource type!");
        return;
    }

    // This shows the loading state
    resultsContainer.innerHTML = `<p style="text-align:center; color:#666;">Searching ${type} for "<strong>${query}</strong>"...</p>`;

    // This handles and router and decide which API to call
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


// This is for the functions and for creating the UI cards

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


// First we have the arXiv API (uses XML data) 
async function fetchArxiv(query) {
    // the target URL 
    const targetUrl = `https://export.arxiv.org/api/query?search_query=all:${query}&start=0&max_results=5`;
    
    //  used CORS proxy for security to send the data safely
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const str = await response.text(); 
        
        // turn XML to understandable data
        const data = new window.DOMParser().parseFromString(str, "text/xml");
        const entries = data.querySelectorAll("entry");
        
        let html = "";

        // to check if no entries were found
        if (entries.length === 0) {
            resultsContainer.innerHTML = "<p>No arXiv papers found for this keyword.</p>";
            return;
        }

        entries.forEach(entry => {
            // use try-catch inside loop to prevent one bad entry from breaking everything
            try {
                const title = entry.querySelector("title").textContent;
                
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

// Second we have the GitHub API ( uses JSON Data) 
async function fetchGithub(query) {
    // the target URL
    const url = `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=5`;

    const response = await fetch(url);
    const data = await response.json();
    let html = "";

    if (!data.items || data.items.length === 0) {
        resultsContainer.innerHTML = "<p>No repositories found.</p>";
        return;
    }

    data.items.forEach(item => {
        const title = item.full_name; 
        const link = item.html_url;
        const description = item.description ? item.description : "No description available.";
        const stars = ` ${item.stargazers_count} stars`;
        
        // to combine desc and stars for the card
        html += createCard(title, link, `${description} <br> <strong>${stars}</strong>`, "GitHub");
    });

    resultsContainer.innerHTML = html;
    saveResultsToStorage(html, query, 'GitHub');
}

// Third we hav the StackOverflow API ( uses JSON Data) 
async function fetchStackOverflow(query) {
    // the target URL
    const url = `https://api.stackexchange.com/2.3/search?order=desc&sort=relevance&intitle=${query}&site=stackoverflow`;

    const response = await fetch(url);
    const data = await response.json();
    let html = "";

    if (!data.items || data.items.length === 0) {
        resultsContainer.innerHTML = "<p>No discussions found.</p>";
        return;
    }

    data.items.slice(0, 5).forEach(item => {
        const title = item.title; 
        const link = item.link;
        const tags = item.tags.join(", ");
        const description = `Tags: ${tags} | Answered: ${item.is_answered ? "Yes" : "No"}`;
        
        html += createCard(title, link, description, "StackOverflow");
    });

    resultsContainer.innerHTML = html;
    saveResultsToStorage(html, query, 'StackOverflow');
}


// this is a helper function to search results to LocalStorage
function saveResultsToStorage(htmlContent, query, type) {
    const dataToSave = {
        html: htmlContent,
        query: query,
        type: type,

        // is used for expire old data
        timestamp: new Date().getTime() 
    };
     
    // this converts the object to a JSON string and save it
    sessionStorage.setItem('lastSearchResult', JSON.stringify(dataToSave));
}


// page load and restoring data

window.addEventListener('DOMContentLoaded', () => {
    // check if we have saved data
    const savedData = sessionStorage.getItem('lastSearchResult');

    if (savedData) {
        // format JSON string into an object
        const parsedData = JSON.parse(savedData);

        // restore the input values so the user sees what they last searched
        keywordInput.value = parsedData.query;
        resourceType.value = parsedData.type === 'GitHub' ? 'github' : 
                             parsedData.type === 'arXiv' ? 'arxiv' : 'stackoverflow';

        // restore the results
        resultsContainer.innerHTML = parsedData.html;
        
        // tell the user when they refresh the page it's restored from their last session
        const note = document.createElement('p');
        note.style.textAlign = "center";
        note.style.fontSize = "0.8rem";
        note.style.color = "#888";
        note.innerText = "Restored from your last session";
        resultsContainer.insertBefore(note, resultsContainer.firstChild);
    }
});
