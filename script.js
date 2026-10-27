const schedules = [
  [1, 2, 1, 1, 2, 1, 2, 1, 1, 2, 2, 1, 1, 2, 2, 2, 1, 1, 2, 2, 2],
  [2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 1, 2, 2],
  [1, 1, 2, 2, 1, 2, 1, 2, 1, 1, 2, 2, 1, 1, 1, 2, 2, 1, 2, 1, 2]
];

let games = schedules[0];
let proofTimer;

function cumulative(values) {
  return values.reduce((totals, value) => [...totals, totals[totals.length - 1] + value], [0]);
}

function findRun(totals) {
  for (let a = 0; a < totals.length; a++) {
    for (let b = a + 1; b < totals.length; b++) {
      if (totals[b] - totals[a] === 21) return { a, b };
    }
  }
}

function render(stage = 3) {
  const totals = cumulative(games);
  const run = findRun(totals);
  const weeks = document.querySelector('#weeks');
  weeks.innerHTML = '';

  for (let week = 0; week < 3; week++) {
    const slice = games.slice(week * 7, week * 7 + 7);
    const element = document.createElement('section');
    element.className = 'week';
    element.innerHTML = `<div class="week-top"><span>WEEK ${week + 1}</span><span class="week-total">${slice.reduce((a, b) => a + b, 0)} games</span></div><div class="days"></div>`;
    const days = element.querySelector('.days');
    slice.forEach((value, index) => {
      const day = week * 7 + index + 1;
      const inRun = stage === 3 && day > run.a && day <= run.b;
      const cell = document.createElement('div');
      cell.className = `day ${inRun ? 'in-run' : ''}`;
      cell.innerHTML = `<div class="day-label">DAY ${day}</div><div class="day-value">${value} <small>game${value === 1 ? '' : 's'}</small></div>`;
      days.appendChild(cell);
    });
    weeks.appendChild(element);
  }

  document.querySelector('#finding').innerHTML = stage === 3
    ? `The highlighted interval is <strong>day ${run.a + 1} through day ${run.b}</strong>: <code>S${run.b} − S${run.a} = ${totals[run.b]} − ${totals[run.a]} = 21</code>.`
    : `We will use the cumulative totals through day 21. There are 22 of them, including <code>S0 = 0</code>.`;

  const residues = document.querySelector('#residues');
  residues.innerHTML = '';
  totals.forEach((total, day) => {
    const card = document.createElement('div');
    const isMatch = stage >= 2 && (day === run.a || day === run.b);
    card.className = `residue ${isMatch ? 'match' : ''}`;
    card.innerHTML = `<span>S<sub>${day}</sub> = ${total}</span><span class="remainder">${stage === 1 ? '?' : total % 21}</span>`;
    residues.appendChild(card);
  });
}

function shuffleSchedule() {
  const next = [];
  for (let week = 0; week < 3; week++) {
    const values = Array(7).fill(1);
    let extras = Math.floor(Math.random() * 6);
    while (extras > 0) {
      const index = Math.floor(Math.random() * 7);
      if (values[index] < 6) { values[index]++; extras--; }
    }
    next.push(...values);
  }
  games = next;
  clearTimeout(proofTimer);
  render(3);
}

function animateProof() {
  clearTimeout(proofTimer);
  render(1);
  document.querySelector('#proof-title').scrollIntoView({ behavior: 'smooth', block: 'center' });
  proofTimer = setTimeout(() => render(2), 1050);
  setTimeout(() => render(3), 2200);
}

document.querySelector('#random-button').addEventListener('click', shuffleSchedule);
document.querySelector('#animate-button').addEventListener('click', animateProof);
render();
