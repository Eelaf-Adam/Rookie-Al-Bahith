# Rookie AL-Bahith 

**Your Google for AI Research**

**l-Bahith (الباحث) is the Arabic word for "The Researcher.**

**Rookie AL-Bahith** is a specialized search platform designed for newcomers to Artificial Intelligence. It solves the problem of fragmented resources by allowing users to query three critical platforms—arXiv, GitHub, and Stack Overflow—from a single, intuitive interface.

**Live Site:** [https://eelaf.tech](https://eelaf.tech)  
**Demo Video:** [Watch the Demo Here](https://www.awesomescreenshot.com/video/47130910?key=b861089e6979e9d1cae541b041fd1915)


## Key Features
* **Multi-API Integration:** Fetches Research Papers, Source Code, and Q&A simultaneously.
* **Smart Filtering:** Filter results by resource type (Papers, Repositories, or Q&A).
* **Data Persistence:** Uses `sessionStorage` to save your search results, ensuring data isn't lost on page refresh.
* **Fallback Mechanism:** Loads curated "Seed Data" if the user visits for the first time or if APIs are unreachable.
* **Deployment:** Fully deployed on a distributed Nginx infrastructure with Load Balancing and SSL.
* **Secure:** Fully encrypted via HTTPS (Let's Encrypt).

## Architecture & Technologies

### Tech Stack
* **Frontend:** HTML5, CSS3, JavaScript (ES6+).
* **Backend Infrastructure:** Nginx Web Servers (Ubuntu).
* **Load Balancer:** Haproxy.
* **Domain Management:** DNS Configuration via .tech Domain.
  
---

## APIs Used
This project was built using vanilla HTML5, CSS3, and JavaScript (ES6+). It relies on the following external APIs:

| Service | Purpose | Documentation Link |
| :--- | :--- | :--- |
| **arXiv API** | To fetch scientific pre-prints and research papers. Accessed via a CORS proxy (`allorigins.win`) to handle browser security.| [arXiv API Docs](https://arxiv.org/help/api) |
| **GitHub REST API** | To find top-rated AI/ML repositories (sorted by stars). | [GitHub Search API](https://docs.github.com/en/rest/search) |
| **Stack Exchange API** | To fetch relevant Q&A discussions from Stack Overflow. | [Stack Exchange API](https://api.stackexchange.com/) |

---

## Part 1: Local Installation

To run this application on your local machine:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/Rookie-Al-Bahith.git
    ```

2.  **Navigate to the project folder:**
    ```bash
    cd Rookie-Al-Bahith
    ```

3.  **Run the Application:**
    ```bash
     Use "Live Server" (VS Code Extension)(VS Code):** Right-click `index.html` and select "Open with Live Server".
     ```

## Part 2: Deployment Instructions
The application is deployed on a custom infrastructure comprising two backend web servers and one load balancer, ensuring high availability and scalability.

The application is deployed on a 3-server infrastructure using Ubuntu 20.04.

### 1. Web Servers (Web-01 & Web-02)
Both web servers are configured to serve the static frontend files using Nginx.

* **Step 1:** Install Nginx.
    ```bash
    sudo apt-get update && sudo apt-get install -y nginx
    ```
* **Step 2:** Clone the repository.
    ```bash
    # Clone specific folder to web root
    sudo git clone https://github.com/Eelaf-Adam/Rookie-Al-Bahith.git you will then see this folder strcture /var/www/html/Rookie-Al-Bahith
    ```
* **Step 3:** Nginx configuration created at `/etc/nginx/sites-available/default-rookie`.
* **Step 3:** Update Nginx config to point root to `/var/www/html/Rookie-Al-Bahith`.
* **Step D:** Custom headers were added to identify which server is handling the request (for verification):
    * Web-01: `add_header X-Served-By "Web-01";`
    * Web-02: `add_header X-Served-By "Web-02";`
* **Step 4:** Restart Nginx.
    ```bash
    sudo service nginx restart
    ```

### 2. Load Balancer (Lb-01)
The Load Balancer distributes traffic and handles SSL termination.

* **Step 1:** Install HAProxy.
    ```bash
    sudo apt-get install -y haproxy
    ```
* **Step 2:** Prepare SSL by combining Certbot keys into a single `.pem` file.
    ```bash
    cat /etc/letsencrypt/live/eelaf.tech/fullchain.pem /etc/letsencrypt/live/eelaf.tech/privkey.pem > /etc/ssl/private/eelaf-combined.pem
    ```
* **Step 3:** Configure `/etc/haproxy/haproxy.cfg` to use the **Round Robin** algorithm.

**Configuration Snippet:**
```haproxy
frontend eelaf-http-in
    bind *:80
    redirect scheme https code 301 if !{ ssl_fc }

frontend eelaf-https-in
    bind *:443 ssl crt /etc/ssl/private/eelaf-combined.pem
    default_backend eelaf-backend

backend eelaf-backend
    balance roundrobin
    server web-01 3.95.151.193:80 check
    server web-02 3.88.39.61:80 check
  ```

### Verifying Load Balancing
You can verify the load balancer is distributing traffic by inspecting the HTTP headers:
1.  Open Developer Tools (F12) -> Network Tab.
2.  Refresh `https://eelaf.tech` multiple times.
3.  Check the **Response Headers** for `X-Served-By`. You will see it toggle between `"Web-01"` and `"Web-02"`.

---

## Challenges & Solutions

**1. CORS Errors with arXiv API**
* *Challenge:* The browser blocked requests to the arXiv XML endpoint because it lacks CORS headers for client-side fetching.
* *Solution:* I routed the requests through a CORS proxy service (`https://api.allorigins.win`) which adds the necessary Access-Control headers, allowing the data to load securely.

**2. Nginx File Path Issues**
* *Challenge:* After deployment, Nginx showed the default welcome page because my `index.html` was inside a subfolder, not the root.
* *Solution:* I modified the Nginx configuration `root` directive to point explicitly to `/var/www/html/Rookie-Al-Bahith` instead of the default `/var/www/html`.

**3. Data Loss on Refresh**
* *Challenge:* Users lost their search results if they accidentally refreshed the page.
* *Solution:* Implemented `sessionStorage` logic in JavaScript. The app now saves the last search result HTML and restores it automatically upon page load.

---

## Credits & Attribution

* **API Data:** Provided by [arXiv.org](https://arxiv.org), [GitHub](https://github.com), and [Stack Exchange](https://stackexchange.com).
* **Infrastructure Reference:** Deployment configurations adapted from Nginx documentation and ALX/Holberton course materials.
* **Icons/Fonts:** Interface styled using standard CSS libraries.

---

**Author:** Eelaf Adam
**License:** MIT



