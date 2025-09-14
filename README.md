<!-- README.md for ICD-11 API -->

<h1 style="text-align:center; color:#2c3e50;">📚 ICD-11 API</h1>
<p style="text-align:center; font-size:1.1em; color:#34495e;">Fetch ICD-11 codes for your query diseases easily with this simple API.</p>

<hr style="border:1px solid #ecf0f1;">

<h2 style="color:#2980b9;">✨ Features</h2>
<ul style="color:#2c3e50; font-size:1em;">
  <li>Search ICD-11 codes for any disease name.</li>
  <li>Returns FHIR-compatible JSON data.</li>
  <li>Simple GET endpoint with query parameter.</li>
</ul>

<hr style="border:1px solid #ecf0f1;">

<h2 style="color:#2980b9;">🔑 Prerequisites</h2>
<p style="color:#2c3e50; font-size:1em;">
  To use the official ICD-11 API, you need to register on the <a href="https://icd.who.int/icdapi/Account/Register" target="_blank">ICD-11 API Portal</a> and obtain your <strong>Client ID</strong> and <strong>Client Secret</strong>.
</p>
<p style="color:#e74c3c; font-weight:bold;">Note: The API will not work without these credentials.</p>

<hr style="border:1px solid #ecf0f1;">

<h2 style="color:#2980b9;">💻 Installation</h2>
<ol style="color:#2c3e50; font-size:1em;">
  <li>Clone or download this repository.</li>
  <li>Open terminal and run <code>npm i</code> to install dependencies.</li>
</ol>

<h2 style="color:#2980b9;">🚀 Running the API</h2>
<p style="color:#2c3e50; font-size:1em;">
  Start the server using <code>nodemon server.js</code> or <code>node server.js</code>.
</p>

<h2 style="color:#2980b9;">📡 Usage</h2>
<p style="color:#2c3e50; font-size:1em;">
  Make a GET request to the endpoint with the disease name as a query parameter:
</p>

<pre style="background-color:#ecf0f1; padding:10px; border-radius:5px; color:#2c3e50;">
GET: http://localhost:3000/fhir/icd11/search?name=&lt;disease_name&gt;
</pre>

<p style="color:#2c3e50; font-size:1em;">
Replace <code>&lt;disease_name&gt;</code> with your disease query, e.g. <code>diabetes</code>.
</p>

<hr style="border:1px solid #ecf0f1;">

<h2 style="color:#2980b9;">💡 Example Query & Response</h2>

<p style="color:#2c3e50; font-size:1em;">Query:</p>
<pre style="background-color:#ecf0f1; padding:10px; border-radius:5px; color:#2c3e50;">
GET: http://localhost:3000/fhir/icd11/search?q=diabetes
</pre>

<p style="color:#2c3e50; font-size:1em;">Response:</p>
<pre style="background-color:#ecf0f1; padding:10px; border-radius:5px; color:#2c3e50;">
{
  "query": "diabetes",
  "count": 50,
  "results": [
    {
      "id": "1697306310",
      "icd11Code": "5A14",
      "title": "Diabetes mellitus, type unspecified",
      "score": 1,
      "synonyms": [
        "&lt;em class='found'&gt;diabetes&lt;/em&gt; NOS",
        "controlled &lt;em class='found'&gt;diabetes&lt;/em&gt;",
        "controlled &lt;em class='found'&gt;diabetic&lt;/em&gt;",
        "&lt;em class='found'&gt;diabetes&lt;/em&gt; mellitus NOS",
        "severe &lt;em class='found'&gt;diabetes&lt;/em&gt; mellitus"
      ]
    },
    {
      "id": "1320503631",
      "icd11Code": "JA63.2",
      "title": "Diabetes mellitus arising in pregnancy",
      "score": 0.724,
      "synonyms": [
        "&lt;em class='found'&gt;diabetes&lt;/em&gt; of pregnancy",
        "gestational &lt;em class='found'&gt;diabetes&lt;/em&gt;",
        "Gestational &lt;em class='found'&gt;diabetes&lt;/em&gt; mellitus NOS"
      ]
    }
    // ... more results
  ]
}
</pre>

<hr style="border:1px solid #ecf0f1;">
