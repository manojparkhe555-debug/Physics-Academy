const loginView = document.getElementById("loginView");
const appView = document.getElementById("appView");
const contentPanel = document.getElementById("contentPanel");
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("studentName").value.trim();
  const role = document.getElementById("personType").value;
  const batch = document.getElementById("batch").value;
  if (!name) return;
  document.getElementById("displayName").textContent = name;
  document.getElementById("roleBatch").textContent = `${role.toUpperCase()} • ${batch.toUpperCase()}`;
  loginView.classList.add("hidden");
  appView.classList.remove("hidden");
  showPanel("home");
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  appView.classList.add("hidden");
  loginView.classList.remove("hidden");
});

document.querySelectorAll("[data-panel]").forEach(button => {
  button.addEventListener("click", () => showPanel(button.dataset.panel));
});

function showPanel(panel) {
  const heading = (eyebrow, title, body) => `
    <div class="panel-top"><div><div class="eyebrow">${eyebrow}</div><h2>${title}</h2></div><span class="pill">Preview</span></div>${body}`;
  if (panel === "home") {
    contentPanel.innerHTML = heading("GET STARTED", "Welcome to your dashboard",
      '<p class="muted">Choose Study material, Online tests, Attendance or Test results above to preview the app.</p>');
  } else if (panel === "materials") {
    contentPanel.innerHTML = heading("YOUR LIBRARY", "Study material", `
      <p class="muted">Sample chapter list for your selected batch. Real notes and PDF uploads will be connected later.</p>
      <div class="material-list">
        <div class="list-item"><div><strong>Units and Measurements</strong><small>Chapter notes • PDF to be added</small></div><span class="tag">Class notes</span></div>
        <div class="list-item"><div><strong>Motion in a Straight Line</strong><small>Concept notes • PDF to be added</small></div><span class="tag">Chapter 2</span></div>
        <div class="list-item"><div><strong>Practice Formula Sheet</strong><small>Revision resource • PDF to be added</small></div><span class="tag">Revision</span></div>
      </div>`);
  } else if (panel === "tests") {
    contentPanel.innerHTML = heading("PRACTICE ZONE", "Quick Physics test", `
      <p class="muted">Sample question: this demo test does not save scores to a teacher account.</p>
      <form id="quizForm">
        <div class="question"><p>1. What is the SI unit of force?</p>
          <label class="answer"><input type="radio" name="q1" value="a" required> Joule</label>
          <label class="answer"><input type="radio" name="q1" value="b"> Newton</label>
          <label class="answer"><input type="radio" name="q1" value="c"> Watt</label>
        </div>
        <div class="question"><p>2. Which quantity is a vector?</p>
          <label class="answer"><input type="radio" name="q2" value="a" required> Speed</label>
          <label class="answer"><input type="radio" name="q2" value="b"> Distance</label>
          <label class="answer"><input type="radio" name="q2" value="c"> Velocity</label>
        </div>
        <button class="primary" type="submit">Submit answers</button><div id="quizResult"></div>
      </form>`);
    document.getElementById("quizForm").addEventListener("submit", e => {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      let score = 0;
      if (data.get("q1") === "b") score++;
      if (data.get("q2") === "c") score++;
      document.getElementById("quizResult").innerHTML = `<div class="result">Your demo score: ${score}/2</div>`;
    });
  } else if (panel === "attendance") {
    contentPanel.innerHTML = heading("CLASS TRACKER", "Attendance", `
      <p class="muted">This is a sample view. Attendance records will be stored securely once the database and teacher tools are added.</p>
      <div class="material-list">
        <div class="list-item"><div><strong>Physics lecture</strong><small>Sample entry • 10 Oct</small></div><span class="tag">Present</span></div>
        <div class="list-item"><div><strong>Numerical practice</strong><small>Sample entry • 12 Oct</small></div><span class="tag">Present</span></div>
        <div class="list-item"><div><strong>Weekly revision</strong><small>Sample entry • 14 Oct</small></div><span class="tag">Not recorded</span></div>
      </div>`);
  } else if (panel === "results") {
    contentPanel.innerHTML = heading("YOUR PROGRESS", "Test results", `
      <p class="muted">Your real test history will appear here after we connect accounts and database.</p>
      <div class="list-item"><div><strong>Quick Physics test</strong><small>Try the sample test to see a score</small></div><span class="tag">Practice</span></div>`);
  }
}