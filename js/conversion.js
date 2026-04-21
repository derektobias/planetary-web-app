const units = {

length:{
m:{factor:1,label:"Meters (m)"},
mm:{factor:0.001,label:"Millimeters (mm)"},
cm:{factor:0.01,label:"Centimeters (cm)"},
km:{factor:1000,label:"Kilometers (km)"},
in:{factor:0.0254,label:"Inches (in)"},
ft:{factor:0.3048,label:"Feet (ft)"},
mi:{factor:1609.34,label:"Miles (mi)"},
AU:{factor:1.496e11,label:"Astronomical Units (AU)"},
ly:{factor:9.461e15,label:"Light Years (ly)"},
"Earth radius":{factor:6.371e6,label:"Earth Radius (R⊕)"},
"Jupiter radius":{factor:6.9911e7,label:"Jupiter Radius (R♃)"},
"Lunar radius":{factor:1.737e6,label:"Moon Radius (R☽)"}
},

area:{
"m²":{factor:1,label:"Square Meters (m²)"},
"cm²":{factor:0.0001,label:"Square Centimeters (cm²)"},
"km²":{factor:1e6,label:"Square Kilometers (km²)"},
ac:{factor:4046.86,label:"Acres (ac)"},
ha:{factor:10000,label:"Hectares (ha)"},
"mi²":{factor:2.59e6,label:"Square Miles (mi²)"}
},

volume:{
"m³":{factor:1,label:"Cubic Meters (m³)"},
L:{factor:0.001,label:"Liters (L)"},
mL:{factor:1e-6,label:"Milliliters (mL)"},
gal:{factor:0.00378541,label:"US Gallons (gal)"},
"ft³":{factor:0.0283168,label:"Cubic Feet (ft³)"}
},

mass:{
kg:{factor:1,label:"Kilograms (kg)"},
g:{factor:0.001,label:"Grams (g)"},
mg:{factor:1e-6,label:"Milligrams (mg)"},
ton:{factor:1000,label:"Metric Tons (ton)"},
oz:{factor:0.0283495,label:"Ounces (oz)"},
lb:{factor:0.453592,label:"Pounds (lb)"},
"Earth mass":{factor:5.972e24,label:"Earth Mass (M\u2295)"},
"Solar mass":{factor:1.989e30,label:"Solar Mass (M\u2609)"},
"Jupiter mass":{factor:1.898e27,label:"Jupiter Mass (M♃)"},
"Lunar mass":{factor:7.342e22,label:"Moon Mass (M☽)"}
},

time:{
s:{factor:1,label:"Seconds (s)"},
min:{factor:60,label:"Minutes (min)"},
hr:{factor:3600,label:"Hours (hr)"},
day:{factor:86400,label:"Days (day)"},
yr:{factor:3.154e7,label:"Years (yr)"},
Myr:{factor:3.154e13,label:"Million Years (Myr)"},
Gyr:{factor:3.154e16,label:"Billion Years (Gyr)"}
},

speed:{
"m/s":{factor:1,label:"Meters per Second (m/s)"},
"km/h":{factor:0.277778,label:"Kilometers per Hour (km/h)"},
mph:{factor:0.44704,label:"Miles per Hour (mph)"},
Mach:{factor:343,label:"Mach (Mach)"},
c:{factor:299792458,label:"Speed of Light (c)"}
},

energy:{
J:{factor:1,label:"Joules (J)"},
kJ:{factor:1000,label:"Kilojoules (kJ)"},
cal:{factor:4.184,label:"Calories (cal)"},
kWh:{factor:3.6e6,label:"Kilowatt Hours (kWh)"},
eV:{factor:1.602e-19,label:"Electron Volts (eV)"}
},

power:{
W:{factor:1,label:"Watts (W)"},
kW:{factor:1000,label:"Kilowatts (kW)"},
MW:{factor:1e6,label:"Megawatts (MW)"},
hp:{factor:745.7,label:"Horsepower (hp)"}
},

temperature:{
K:{label:"Kelvin (K)"},
C:{label:"Celsius (\u00B0C)"},
F:{label:"Fahrenheit (\u00B0F)"}
}

};

function convertTemp(value,from,to){

let K;

if(from==="K") K=value;
if(from==="C") K=value+273.15;
if(from==="F") K=(value-32)*5/9+273.15;

/* ❗ Fix here */
if(K < 0) return undefined;

if(to==="K") return K;
if(to==="C") return K-273.15;
if(to==="F") return (K-273.15)*9/5+32;

}

function formatNumber(num){

if(num === undefined || num === null) return "";

if(Math.abs(num)>=1e6 || Math.abs(num)<1e-4){
return Number(num).toExponential(4);
}

return Number(num.toFixed(4));

}

function convert(value, type, fromUnit, toUnit){

if(type === "temperature"){
return convertTemp(value, fromUnit, toUnit);
}

let fromFactor = units[type][fromUnit]?.factor;
let toFactor   = units[type][toUnit]?.factor;

if(fromFactor == null || toFactor == null) return;

let base = value * fromFactor;
return base / toFactor;

}

document.querySelectorAll(".converter").forEach(box=>{

let selectedFrom = null;
let selectedTo = null;

const type = box.dataset.type;

const from = box.querySelector(".unitFrom");
const to = box.querySelector(".unitTo");

const searchFrom = box.querySelector(".unitSearchFrom");
const searchTo = box.querySelector(".unitSearchTo");

const input = box.querySelector(".inputValue");
const output = box.querySelector(".outputValue");
const swap = box.querySelector(".swapBtn");

function populateDropdown(container){

container.innerHTML="";

Object.keys(units[type]).forEach(key=>{

let label = units[type][key].label || key;

let item = document.createElement("div");
item.className = "dropdownItem";
item.textContent = label;
item.dataset.value = key;

container.appendChild(item);

});

}

populateDropdown(from);
populateDropdown(to);

selectedFrom = Object.keys(units[type])[0];
selectedTo   = Object.keys(units[type])[1];

setupDropdown(searchFrom, from, true);
setupDropdown(searchTo, to, false);

/* Clear buttons */

box.querySelector(".clearFrom").onclick=()=>{
searchFrom.value="";
selectedFrom = null;
populateDropdown(from);          // 🔥 FULL RESET
filterList(searchFrom, from);
from.style.display="block";
searchFrom.focus();
};

box.querySelector(".clearTo").onclick=()=>{
searchTo.value="";
selectedTo = null;
populateDropdown(to);            // 🔥 FULL RESET
filterList(searchTo, to);
to.style.display="block";
searchTo.focus();
};

function filterList(input, list){

let filter = input.value.toLowerCase();
let items = [...list.children];

/* Always rebuild from original dataset */
let allKeys = Object.keys(units[type]);

list.innerHTML = "";

let matches = [];

allKeys.forEach(key => {

let label = units[type][key].label || key;
let lower = label.toLowerCase();

if(lower.includes(filter)){
matches.push({key, label});
}

});

/* ❗ If no matches → show ALL (this fixes backspace issue) */
if(matches.length === 0){
matches = allKeys.map(key => ({
key,
label: units[type][key].label || key
}));
}

/* Sort matches */
matches.sort((a,b)=>{
if(a.label.toLowerCase().startsWith(filter)) return -1;
if(b.label.toLowerCase().startsWith(filter)) return 1;
return a.label.localeCompare(b.label);
});

/* Render */
matches.forEach(itemData => {

let item = document.createElement("div");
item.className = "dropdownItem";
item.dataset.value = itemData.key;

/* Highlight */
if(filter !== ""){
let regex = new RegExp(`(${filter})`, "gi");
item.innerHTML = itemData.label.replace(regex, `<span class="highlight">$1</span>`);
}else{
item.textContent = itemData.label;
}

list.appendChild(item);

});

/* ✅ ALWAYS keep dropdown visible */
list.style.display = "block";

}

function setupDropdown(input, list, isFrom){

input.addEventListener("click", ()=>{
list.style.display="block";
filterList(input, list); // SHOW ALL IMMEDIATELY
});

input.addEventListener("input", ()=>{
filterList(input, list);

/* reset keyboard selection when typing */
currentIndex = -1;
});

input.addEventListener("focus", ()=>{
list.style.display = "block";
filterList(input, list);
});

list.addEventListener("click",(e)=>{

if(!e.target.classList.contains("dropdownItem")) return;

input.value = e.target.textContent;

if(isFrom){
selectedFrom = e.target.dataset.value;
}else{
selectedTo = e.target.dataset.value;
}

list.style.display="none";

calculate();

});

/* close if clicking outside */
document.addEventListener("click",(e)=>{
if(!list.parentElement.contains(e.target)){
list.style.display="none";
}
});

let currentIndex = -1;

input.addEventListener("keydown",(e)=>{

let items = [...list.children];

if(e.key==="ArrowDown"){

e.preventDefault();
currentIndex = (currentIndex + 1) % items.length;

items.forEach(i=>i.classList.remove("active"));
items[currentIndex].classList.add("active");

}

if(e.key==="ArrowUp"){

e.preventDefault();
currentIndex = (currentIndex - 1 + items.length) % items.length;

items.forEach(i=>i.classList.remove("active"));
items[currentIndex].classList.add("active");

}

if(e.key==="Enter"){

let items = [...list.children];

/* If arrow-selected */
if(currentIndex >= 0){
items[currentIndex].click();
return;
}

/* Otherwise pick BEST MATCH automatically */
let inputText = input.value.toLowerCase();

let match = items.find(item =>
item.textContent.toLowerCase().includes(inputText)
);

if(match){
match.click();
}

}

});

}

function parseScientificInput(str){

if(!str) return NaN;

str = str.replace(/×/g,"x");

let match = str.match(/^([0-9.+-]+)\s*x\s*10\^([+-]?\d+)$/i);

if(match){
return parseFloat(match[1]) * Math.pow(10,parseInt(match[2]));
}

return parseFloat(str);

}

function calculate(){

let value = parseScientificInput(input.value);
if(isNaN(value)) return;

/* Determine units */
let fromUnit = selectedFrom || from.value;
let toUnit   = selectedTo   || to.value;

if(!fromUnit || !toUnit) return;

/* Convert */
let result = convert(value, type, fromUnit, toUnit);

if(result === undefined){
output.value = "undefined";
return;
}

output.value = formatNumber(result);

}

input.addEventListener("input",calculate);
from.addEventListener("change",calculate);
to.addEventListener("change",calculate);

swap.onclick = ()=>{

/* swap selected values */
let tempVal = selectedFrom;
selectedFrom = selectedTo;
selectedTo = tempVal;

/* swap visible text */
let tempText = searchFrom.value;
searchFrom.value = searchTo.value;
searchTo.value = tempText;

calculate();

};

});