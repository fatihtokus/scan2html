# Contributing to scan2html

🙌 Thank you for contributing and joining our mission to help engineers use cloud infrastructure securely and efficiently 🚀.

## Making change in scan2html bash code
1. Execute `git update-index --chmod=+x scan2html`
2. Then commit and push this change.

## Testing the app locally
1. go to project root folder (scan2html) in the commandline
2. http-server . -p 8000
3. For Scan2HtmlWithDefaultData open the following url from the browser: http://localhost:8000/src/auditing.html?auditingEnabled=0&resultsUrl=/test/data/default/results.json
4. For Scan2HtmlWithK8sData open the following url from the browser: http://localhost:8000/src/auditing.html?auditingEnabled=0&resultsUrl=/test/data/k8s/results.json
5. For Scan2HtmlAuditingWithDefaultData open the following url from the browser: http://localhost:8000/src/auditing.html?auditingBaseUrl=/test/data/auditing/

## Code fromatting
1. npx prettier . --write

## Installing and starting a http-server
Node.js has a http-server package that can be used to run a simple local web server. If you’ve got node installed open a command line at the directory your content is in.

Installing the Node.js http-server is simple.

npm install http-server -g
This will install the http-server package globally. Now we can start the server to serve the files in the current directory.

http-server . -p 8000

We’re executing the http-server Node.js application, giving it a dot to indicate it is to serve files from the current directory (this could be replaced with a path) and using -p 8000 to tell the server to run on port 8000

You should then be able to access it using localhost:8000 in your web browser.

To stop the server when finished you can just press Ctrl+c in the terminal.