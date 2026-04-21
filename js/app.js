let selectedPlanets = [];

async function loadPlanets(){

const response = await fetch("../data/planets.json");

const planets = await response.json();

createPlanetGrid(planets);

}

let allPlanets = [];

function createPlanetGrid(planets){

allPlanets = planets;

renderPlanetGrid(planets);

}

function renderPlanetGrid(planets){

const grid = document.getElementById("planet-grid");

grid.innerHTML = "";

planets.forEach(planet => {

const card = document.createElement("div");

card.classList.add("planet-card");

card.innerHTML = `
<img src="${planet.image}">
<p>${planet.name}</p>
`;

card.addEventListener("click", () => selectPlanet(card, planet));

grid.appendChild(card);

});

}

// Categorize planetary body filters by class
document.addEventListener("DOMContentLoaded", () => {

  const classFilter = document.getElementById("class-filter");

  classFilter.addEventListener("change", () => {

    const selectedClass = classFilter.value;

    console.log("Selected filter:", selectedClass);

    let filtered = allPlanets;

    if(selectedClass !== "all"){
      filtered = allPlanets.filter(p =>
        p.class.toLowerCase() === selectedClass
      );
    }

    renderPlanetGrid(filtered);

  });

});

// Create searchbar for planetary bodies
const searchInput = document.getElementById("planet-search");

searchInput.addEventListener("input", () => {

  const query = searchInput.value.toLowerCase();
  const selectedClass = document.getElementById("class-filter").value;

  let filtered = allPlanets;

  // apply class filter FIRST
  if(selectedClass !== "all"){
    filtered = filtered.filter(p =>
      p.class.toLowerCase() === selectedClass
    );
  }

  // THEN apply search
  filtered = filtered.filter(p =>
    p.name.toLowerCase().includes(query)
  );

  renderPlanetGrid(filtered);

});

// Users select which planet(s) to look at
function selectPlanet(card, planet){

// limit selection to 2 planets
if(selectedPlanets.length >= 2 && !card.classList.contains("selected")){
alert("You can only compare 2 planets at a time.");
return;
}

// toggle selection
if(card.classList.contains("selected")){

card.classList.remove("selected");

selectedPlanets = selectedPlanets.filter(p => p.name !== planet.name);

}

else{

card.classList.add("selected");

selectedPlanets.push(planet);

}

console.log("Selected planets:", selectedPlanets);

displayComparison();

displayScale();

}

loadPlanets();

function formatValue(value){

if(value === null || value === undefined){
return "Unknown";
}

if(Array.isArray(value)){
return value.join(" → ");
}

if(typeof value === "object"){
return Object.entries(value)
.map(([k,v]) => `${k}: ${v}%`)
.join(", ");
}

return value;

}

function getSelectedProperties(){

const checkboxes = document.querySelectorAll("#property-controls input:checked");

return Array.from(checkboxes).map(cb => cb.value);

}

// Property Labels
const propertyLabels = {
class: "Class",
parent: "Parent",
moons: "Moons",
mass_kg: "Mass (kg)",
mean_radius_km: "Mean Radius (km)",
volume_km3: "Volume (km³)",
density_kg_m3: "Density (kg/m³)",
gravity_m_s2: "Gravity (m/s²)",
escape_velocity_km_s: "Escape Velocity (km/s)",
oblateness: "Oblateness",

perihelion: "Perihelion (AU/km)",
aphelion: "Aphelion (AU/km)",
semi_major_axis: "Semi-Major Axis (AU/km)",

orbital_period_days: "Orbital Period (days)",
rotation_period_hours: "Rotation Period (hours)",
rotation_speed_kmh: "Rotation Speed (km/hr)",
eccentricity: "Eccentricity",
axial_tilt_deg: "Axial Tilt (°)",
orbital_inclination_deg: "Orbital Inclination (°)",

avg_temp_c: "Avg Surface Temp (°C)",
temp_range_c: "Surface Temp Range (°C)",
magnetism_gauss: "Magnetism (Gauss)",
atmospheric_density_kg_m3: "Atmospheric Density (kg/m³)",
atmospheric_pressure_bar: "Atmospheric Pressure (bar)",
atmospheric_composition: "Atmospheric Composition",
scale_height_km: "Scale Height (km)",

surface_composition: "Surface Composition",
albedo: "Albedo"
};

// Get values WITH units
function getValueWithUnits(planet, prop){

// Handle moons vs planets
const isMoon = planet.class === "Moon";

if(prop === "perihelion"){
return isMoon ? planet.perihelion_km: planet.perihelion_au;
}

if(prop === "aphelion"){
return isMoon ? planet.aphelion_km: planet.aphelion_au;
}

if(prop === "semi_major_axis"){
return isMoon ? planet.semi_major_axis_km: planet.semi_major_axis_au;
}

let value = planet[prop];

// Format arrays (temp range)
if(Array.isArray(value)){
return value[0] + " to " + value[1];
}

return value ?? "Unknown";
}

// Displays the comparison of the planetary bodies
function displayComparison(){

const container = document.getElementById("comparison-container");
container.innerHTML = "";

const selectedProps = getSelectedProperties();

selectedPlanets.forEach((planet, index) => {

const card = document.createElement("div");
card.classList.add("comparison-card");

let propertyHTML = "";

selectedProps.forEach(prop => {

let value = planet[prop];
let className = "";

if(selectedPlanets.length === 2){

const other = selectedPlanets[1 - index][prop];

if(typeof value === "number" && typeof other === "number"){

if(value > other){
className = "better";
}
else if(value < other){
className = "worse";
}

}

}

// Update orbital labels for Moons
function getDynamicLabel(planet, prop){

const isMoon = planet.class === "Moon";

if(prop === "perihelion"){
return isMoon ? "Perigee (km)" : "Perihelion (AU)";
}

if(prop === "aphelion"){
return isMoon ? "Apogee (km)" : "Aphelion (AU)";
}

if(prop === "semi_major_axis"){
return isMoon ? "Semi-Major Axis to Parent (km)" : "Semi-Major Axis (AU)";
}

return propertyLabels[prop] || prop;
}

const label = getDynamicLabel(planet, prop);
const val = getValueWithUnits(planet, prop);

propertyHTML += `
<p class="${className}">
<strong>${label}:</strong> ${val}
</p>
`;

});

card.innerHTML = `
<img src="${planet.image}">
<h2>${planet.name}</h2>
${propertyHTML}
`;

container.appendChild(card);

});

}

document.addEventListener("change", () => {

displayComparison();

});

const toggleButton = document.getElementById("toggle-sidebar");

toggleButton.addEventListener("click", () => {

document.body.classList.toggle("sidebar-collapsed");

});


// Scales the displayed planetary bodies according to their size ratios
function displayScale(){

const container = document.getElementById("scale-container");

container.innerHTML = "";

if(selectedPlanets.length === 0) return;

const SCALE_FACTOR = 0.01; 
// reduces real km sizes into display pixels

selectedPlanets.forEach(planet => {

const size = planet.mean_radius_km * SCALE_FACTOR;

const planetDiv = document.createElement("div");

planetDiv.classList.add("scale-planet");

planetDiv.style.width = size + "px";
planetDiv.style.height = size + "px";

planetDiv.innerHTML = `<span>${planet.name}<br>${planet.mean_radius_km} km</span>`;

container.appendChild(planetDiv);

});

}

// Allow arrow keys to toggle through Controls section
const planetGrid = document.getElementById("planet-grid");

document.addEventListener("keydown", (e) => {

if(!planetGrid) return;

if(e.key === "ArrowDown"){
planetGrid.scrollBy({ top: 80, behavior: "smooth" });
}

if(e.key === "ArrowUp"){
planetGrid.scrollBy({ top: -80, behavior: "smooth" });
}

});

