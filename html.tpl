<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <link
      rel="icon"
      href="assets/pinecone-software-limited-favicon.ico"
      type="image/x-icon"
    />
    <link
      rel="stylesheet"
      href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
      integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
      crossorigin="anonymous"
    />
    <link
      href="https://fonts.googleapis.com/css?family=Roboto:400,500,700&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
      rel="stylesheet"
      integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN"
      crossorigin="anonymous"
    />
	<style>
	html {
  /*
    * This propery keeps the scroll on the page at all times.
    * Although it sounds inefficient, we keep this to have a better user interface while filtering.
  */
  overflow-y: scroll;
}

body {
  font-family: "Roboto", sans-serif;
}

/* General focus reset */
textarea:focus,
input[type="text"]:focus,
input[type="password"]:focus,
input[type="datetime"]:focus,
input[type="datetime-local"]:focus,
input[type="date"]:focus,
input[type="month"]:focus,
input[type="time"]:focus,
input[type="week"]:focus,
input[type="number"]:focus,
input[type="email"]:focus,
input[type="url"]:focus,
input[type="search"]:focus,
input[type="tel"]:focus,
input[type="color"]:focus {
  border-color: transparent;
  box-shadow: 0 1px 1px transparent inset, 0 0 8px transparent;
  outline: 0 none;
  border-radius: 0;
}

/* Component level style */
input[type="text"],
input[type="text"]:focus {
  border: none;
  border-bottom: 3px solid #ddd;
  border-radius: 0;
  height: 70px;
  font-size: 32px;
  padding: 5px;
}

::placeholder {
  /* Firefox, Chrome, Opera */
  color: #ddd !important;
}

:-ms-input-placeholder {
  /* Internet Explorer 10-11 */
  color: #ddd !important;
}

::-ms-input-placeholder {
  /* Microsoft Edge */
  color: #ddd !important;
}

h1 {
  font-size: 56px;
  font-weight: 700;
}

th {
  width: 20%;
  cursor: pointer;
}

th:hover {
  background-color: #fdf893;
}

.order:hover {
  background-color: #fdf893 !important;
}

.err {
  display: none;
  font-size: 18px;
  padding: 15px;
  border-bottom: 5px solid black;
  background-color: #fcf113;
  border-radius: 10px;
}

.thead-flash-once {
  -webkit-animation: thead-flash-once 0.4s ease-in-out 2; /* Safari 4+ */
  -moz-animation: thead-flash-once 0.4s ease-in-out 2; /* Fx 5+ */
  -o-animation: thead-flash-once 0.4s ease-in-out 2; /* Opera 12+ */
  animation: thead-flash-once 0.4s ease-in-out 2; /* IE 10+, Fx 29+ */
}

@keyframes thead-flash-once {
  0% {
    background-color: transparent;
  }
  50% {
    background-color: #fdf893;
  }
  100% {
    background-color: transparent;
  }
}

.dev-signature ul {
  margin: 0;
  font-size: 15px;
}

.dev-signature .item-linkedin a {
  color: #2867b2;
}

.dev-signature .item-website a {
  color: #212529;
}

/* Very basic media queries */
@media (max-width: 1200px) {
  .speech-bubble-left,
  .speech-bubble-right {
    display: none !important;
  }

  table {
    font-size: 12px;
    overflow: hidden;
  }

  h1 {
    font-size: 36px;
  }
}

@media (max-width: 600px) {
  table {
    font-size: 8px;
  }
  .dev-signature {
    justify-content: flex-start !important;
  }
}
	</style>

    <title>
      Trivy Report - {{- escapeXML ( index . 0 ).Target }} - {{ now }}
    </title>
  </head>
  <body>
    <div class="container">
      <div class="row mt-5 mb-3">
        <div class="col-md-12">
          <div class="page-header">
            <h2>Trivy Report - {{- escapeXML ( index . 0 ).Target }} - {{ now }}</h2>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
            <input
            class="form-control form-control-lg filter-input"
            type="text"
            placeholder="Filter results..."
            autofocus="autofocus"
            value=""
          />
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <table class="table table-sm mt-5">
            <thead>
              <tr>
                <th scope="col">
                  Type  &nbsp;
                  <i class="fa fa-sort" aria-hidden="true"></i>
                </th>
                <th scope="col">
                  ID &nbsp;
                  <i class="fa fa-sort" aria-hidden="true"></i>
                </th>
                <th scope="col">
                  Check &nbsp;
                  <i class="fa fa-sort" aria-hidden="true"></i>
                </th>
                <th scope="col">
                  Severity &nbsp;
                  <i class="fa fa-sort" aria-hidden="true"></i>
                </th>
                <th scope="col">
                  Target &nbsp;
                  <i class="fa fa-sort" aria-hidden="true"></i>
                </th>
                 <th scope="col">
                  Message &nbsp;
                  <i class="fa fa-sort" aria-hidden="true"></i>
                 </th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
      <footer>
        <div class="row">
          <div
            class="col-md-12 mt-5 mb-5 dev-signature d-flex flex-wrap justify-content-end align-content-center"
          >
            <ul class="list-inline">
              <li class="list-inline-item">
                - Developed by <b>Fatih Tokus</b>&nbsp;
              </li>
              <li class="list-inline-item item-github">
                <a
                  href="https://github.com/fatihtokus/"
                  target="_blank"
                >
                  <i class="fa fa-github"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>


<script>
const resultJson = [
    {{- range . }}
        {{- $target := escapeXML .Target -}}
        {{- range .Misconfigurations }}
            {
                "Type": "{{ escapeXML .Type }}",
                "ID": "{{ escapeXML .ID }}",
                "Title": "{{ escapeXML .Title }}",
                "Severity": "{{ escapeXML .Severity }}",
                "Target": "{{- $target }}",
                "Message": "{{ escapeXML .Message }}",
            },
        {{- end }}
  {{- end }}
  ]
const tbody = document.querySelector('tbody');
const thead = document.querySelector('thead');
const th = document.querySelectorAll('thead th');

// TABLE CREATION
resultJson.forEach((result) => {
  const values = Object.values(result);
  let row = tbody.insertRow(-1);
  row.className = 'result';

  for (const value of values) {
    let cell = row.insertCell();
    cell.innerHTML = value;
  }
});

// FILTER
let filterInput = document.querySelector('.filter-input');
const results = document.querySelectorAll('.result');

filterInput.addEventListener('keyup', () => {
  let criteria = filterInput.value.toUpperCase().trim();
  let j = 0;

  results.forEach((data) => {
    thead.style.opacity = '1'
    if (data.innerText.toUpperCase().indexOf(criteria) > -1) {
      data.style.display = '';
    } else {
      data.style.display = 'none';
      j++;
      if (j === results.length) {
        thead.style.opacity = '0.2'
      }
    }
  });
});

// SORT
let sortDirection;

th.forEach((col, idx) => {
  col.addEventListener('click', () => {
    sortDirection = !sortDirection;
    const rowsArrFromNodeList = Array.from(results);
    const filteredRows = rowsArrFromNodeList.filter(item => item.style.display != 'none');

    filteredRows.sort((a, b) => {
      return a.childNodes[idx].innerHTML.localeCompare(b.childNodes[idx].innerHTML, 'en', { numeric: true, sensitivity: 'base' });
    }).forEach((row) => {
      sortDirection ? tbody.insertBefore(row, tbody.childNodes[tbody.length]) : tbody.insertBefore(row, tbody.childNodes[0]);
    });

  });
});

	</script>
  </body>
</html>
