let pendingRequests = [];
let approvedRequests = [];
let rejectedRequests = [];
let currentManager = "";
let selectedOffice = "";
let previousSection = ""; 

const managerAccounts = {
  Finance: { username: "fin", password: "1" },
  IT: { username: "it", password: "1" },
  "Corporate Planning": { username: "cp", password: "1" },
  Admin: { username: "admin", password: "1" },
  "Member Services": { username: "ms", password: "1" },
  Audit: { username: "audit", password: "1" },
  Engineering: { username: "eng", password: "1" },
  Operations: { username: "ops", password: "1" }
};

//Improved helper function to clear forms completely
function clearForm(formId) {
  const form = document.getElementById(formId);
  if (form) {
    form.querySelectorAll('input[type="text"], input[type="password"], textarea, select').forEach(element => {
      element.value = ''; 
    });
    //reset selected index for select elements
    form.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
  }
}

function proceedToLogin() {
  selectedOffice = document.getElementById("officeDropdown").value;
  if (!selectedOffice) {
    alert("Please select an office.");
    return;
  }
  hideAllSections();
  document.getElementById("roleSidebar").style.display = "block";
  previousSection = "officeSelection"; 
}

function showLogin(role) {
  hideAllSections();
  document.getElementById("loginForm").style.display = "block";
  clearForm("loginForm"); 
  previousSection = "roleSidebar"; 
}

function hideAllSections() {
  const sections = ["officeSelection", "loginForm", "requestFormSection", "managerSection", "guardRequests", "adminHistorySection", "roleSidebar"];
  sections.forEach(id => document.getElementById(id).style.display = "none");
}

function checkLogin() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (user === "emp" && pass === "1") {
    hideAllSections();
    document.getElementById("requestFormSection").style.display = "block";
    setOfficeTitle();
    previousSection = "loginForm"; 
  } else if (user === "g" && pass === "1") {
    hideAllSections();
    document.getElementById("guardRequests").style.display = "block";
    displayGuardRequests();
    previousSection = "loginForm"; 
  } else {
    for (const dept in managerAccounts) {
      if (user === managerAccounts[dept].username && pass === managerAccounts[dept].password) {
        currentManager = dept;
        hideAllSections();
        document.getElementById("managerSection").style.display = "block";
        displayManagerRequests();
        previousSection = "loginForm"; 
        return;
      }
    }
    alert("Invalid credentials.");
  }
  clearForm("loginForm"); 
}

function setOfficeTitle() {
  const officeTitleElement = document.getElementById("officeTitle");
  officeTitleElement.textContent = selectedOffice;
  officeTitleElement.className = "office-title " + selectedOffice.replace(/\s+/g, '');
}

function submitRequest() {
  const name = document.getElementById("name").value;
  const dept = document.getElementById("department").value;
  const purpose = document.getElementById("purpose").value;
  const dest = document.getElementById("destination").value;
  const vehicle = document.getElementById("serviceVehicle").value;
  const companions = document.getElementById("companions").value;

  if (!name || !dept || !purpose || !dest || !vehicle || !companions) {
    alert("Please fill in all fields.");
    return;
  }

  const request = {
    name, dept, purpose, dest, vehicle, companions, time: new Date().toLocaleString(), office: selectedOffice, departure: null, arrival: null
  };

  pendingRequests.push(request);
  document.getElementById("submissionStatus").innerText = "Request submitted for manager approval.";
  clearForm("requestFormSection"); 
}

function displayManagerRequests() {
  const tbody = document.getElementById("managerList");
  tbody.innerHTML = "";
  pendingRequests
    .filter(req => req.dept === currentManager)
    .forEach((req, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${req.name}</td><td>${req.dept}</td><td>${req.purpose}</td>
        <td>${req.dest}</td><td>${req.vehicle}</td><td>${req.companions}</td>
        <td class="action-btns">
          <button onclick="approveRequest(${index})">Approve</button>
          <button onclick="rejectRequest(${index})">Reject</button>
        </td>`;
      tbody.appendChild(row);
    });
}

function approveRequest(index) {
  const req = pendingRequests.splice(index, 1)[0];
  req.status = "Approved";
  approvedRequests.push(req);
  document.getElementById("submissionStatus").innerText = ""; 
  displayManagerRequests();
  displayGuardRequests();
}

function rejectRequest(index) {
  const req = pendingRequests.splice(index, 1)[0];
  req.status = "Rejected";
  rejectedRequests.push(req);
  document.getElementById("submissionStatus").innerText = ""; 
  displayManagerRequests();
  displayGuardRequests();
}

function updateDepartureTime(button) {
  const row = button.parentNode.parentNode; 
  const departureCell = row.querySelector('td:nth-child(9)');
  const newDepartureTime = new Date().toLocaleString();
  departureCell.textContent = newDepartureTime;
  const requestIndex = approvedRequests.findIndex(req => req.name === row.querySelector('td:nth-child(1)').textContent);
  if (requestIndex > -1) {
      approvedRequests[requestIndex].departure = newDepartureTime;
  }
}

function updateArrivalTime(button) {
  const row = button.parentNode.parentNode; 
  const arrivalCell = row.querySelector('td:nth-child(10)');
  const newArrivalTime = new Date().toLocaleString();
  arrivalCell.textContent = newArrivalTime;
  const requestIndex = approvedRequests.findIndex(req => req.name === row.querySelector('td:nth-child(1)').textContent);
  if (requestIndex > -1) {
      approvedRequests[requestIndex].arrival = newArrivalTime;
  }
}

function displayGuardRequests() {
  const aList = document.getElementById("approvedList");
  const rList = document.getElementById("rejectedList");
  aList.innerHTML = "";
  rList.innerHTML = "";

  approvedRequests.forEach(req => {
    const row = aList.insertRow();
    createTableRow(row, req);
  });

  rejectedRequests.forEach(req => {
    const row = rList.insertRow();
    createTableRow(row, req);
  });
}

function createTableRow(row, req) {
    let departureTime = req.departure || `<button onclick="updateDepartureTime(this)">Update Departure</button>`;
    let arrivalTime = req.arrival || `<button onclick="updateArrivalTime(this)">Update Arrival</button>`;

    [req.name, req.dept, req.purpose, req.dest, req.vehicle, req.companions, req.time, req.status, departureTime, arrivalTime].forEach(cellData => {
        const cell = row.insertCell();
        cell.innerHTML = cellData; 
    });
}

function showAdminHistory() {
  hideAllSections();
  document.getElementById("adminHistorySection").style.display = "block";
  document.getElementById("adminOfficeSelect").selectedIndex = 0;
  previousSection = "officeSelection"; 
}

function displayAdminHistory() {
  const selectedOffice = document.getElementById("adminOfficeSelect").value;
  const historyTable = document.getElementById("adminHistoryTable");
  historyTable.innerHTML = "";

  const allRequests = [...approvedRequests, ...rejectedRequests];
  const filteredRequests = allRequests.filter(req => req.office === selectedOffice);

  if (filteredRequests.length === 0) {
    historyTable.innerHTML = "<p>No requests found for this office.</p>";
    return;
  }

  const table = document.createElement("table");
  const headerRow = table.insertRow();
  ["Name", "Department", "Purpose", "Destination", "Service Vehicle", "Companions", "Time", "Status", "Departure", "Arrival"].forEach(header => {
    const th = document.createElement("th");
    th.textContent = header;
    headerRow.appendChild(th);
  });

  filteredRequests.forEach(req => {
    const row = table.insertRow();
    let departureTime = req.departure || "";
    let arrivalTime = req.arrival || "";
    [req.name, req.dept, req.purpose, req.dest, req.vehicle, req.companions, req.time, req.status, departureTime, arrivalTime].forEach(cellData => {
        const cell = row.insertCell();
        cell.textContent = cellData;
    });
  });
  historyTable.appendChild(table);
}

function returnToOfficeSelection() {
    hideAllSections();
    document.getElementById("officeSelection").style.display = "block";
    document.getElementById("officeDropdown").selectedIndex = 0;
    previousSection = "officeSelection";
}

function returnToPrevious() {
  hideAllSections();
  document.getElementById(previousSection).style.display = "block";
  if (previousSection === "loginForm") {
    clearForm("loginForm");
  } else if (previousSection === "requestFormSection") {
    clearForm("requestFormSection");
  } else if (previousSection === "officeSelection") {
    clearForm("officeSelection"); 
  }
}