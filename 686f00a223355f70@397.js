function _1(md){return(
md`# Datatouille Static Map Template Khannah`
)}

function _2(md){return(
md`## Getting Started
You'll need to convert the CitiBike data from an array of \`JSON\` objects to an array of GeoJSON objects. You can refer to the block of code below to get an idea of how an array of GeoJSON objects is structured.

One note to make is that each GeoJSON object in the array is of type \`MultiPolygon\`. Since the CitiBike stations are represented by a single pair of latitude and longitude values, you will want to verify each GeoJSON object in your array is of type \`Point\`. The [following link](https://gis.stackexchange.com/questions/254859/how-to-convert-javascript-array-into-geojson-data) provides a surface-level overview of how converting between the two data types can be done.

After performing the necessary data preparation steps, your new array of GeoJSON objects should then be appended to the map in \`generateMap()\`. You should then append a tooltip to each station; the tooltip should work such that when you hover over the station point, a small box appears with the station name. This will require a few additional lines of code on your side to ensure each GeoJSON object contains the station's name. Example tooltip functionality can be found in \`generateMap()\`.`
)}

async function _arr()
{
  let data = await (await fetch("https://gist.githubusercontent.com/ix4/6f44e559b29a72c4c5d130ac13aad317/raw/a7a3a37f2fe054ebc18871b34b023d312668f035/nyc.geojson")).json();
  let boroughs = data.features;
  return boroughs;
}


function _fetchBikeData(){return(
async function fetchBikeData(url) {
  //Validate whether we have passed a proper URL with URL() constructor with try, catch block
  try {
    let validUrl = new URL(url);
  }
  catch(err) {
    //If the URL() constructor recognized we didn't provide a properly-formatted URL (registers as a TypeError), then we let the user know
    if(err instanceof TypeError)
      throw Error("You have not entered a valid URL to fetch data from. Please change your parameter.");
    //Generic error handling
    else
      throw err;
  }
  //Obtain HTTP response from fetch() call
  let res = await fetch(url)
  //Convert the response into the JSON data we are interested in
  let data = await res.json()
  //Return .data field from JSON since that contains the information we are interested in
  //First verify whether .data field exists in resulting JSON
  if(data.data) {
    return data.data;
  }
  else {
    throw Error("Resulting JSON does not have property of .data\nPlease verify you have passed an appropriate URL");
  }
}
)}

function _5(md){return(
md`### Obtain station information from CitiBike feed using \`fetchBikeData()\``
)}

async function _stationInformation(fetchBikeData){return(
await fetchBikeData("https://gbfs.citibikenyc.com/gbfs/en/station_information.json")
)}

function _stations(){return(
[]
)}

function _8(stationInformation,stations){return(
Object.values(stationInformation["stations"]).forEach(val => 
                                                      stations.push({
                                                        type: "Point", 
                                                        geometry: [val["lon"], val["lat"]],
                                                        properties: {
                                                          name: val['name']
                                                        }
                                                      })
                                         )
)}

function _9(stations){return(
stations
)}

function _10(md){return(
md`### \`generateMap()\` contains various comments on what specific lines do.`
)}

function _generateMap(d3,DOM,stations,callout){return(
async function generateMap() {
  /****** DATA RETRIEVAL *******/
  //Retrieve the data using fetch()
  //We then need to use json() to extract the JSON data of interest. You can actually see this used in fetchData() 
  let data = await (await fetch("https://gist.githubusercontent.com/ix4/6f44e559b29a72c4c5d130ac13aad317/raw/a7a3a37f2fe054ebc18871b34b023d312668f035/nyc.geojson")).json()
  /****** SETUP OF SVG, G PROPERTIES ******/
  //Define width, height properties of map
  var width = 960, height = 500;
  //geoMercator() creates a map projection to populate based on size, position parameters
  var projection = d3.geoMercator()
    .scale(45000)
    // Center the Map in Colombia
    .center([-73.935242, 40.730610])
    .translate([width / 2, height / 2]);
  //d3.geoPath() renders (ie. creates the visualization) a specified projection 
  var path = d3.geoPath()
    .projection(projection);
  //Create the SVG that will contain the map. Then, set the SVG's width and height
  var svg = d3.select(DOM.svg(width, height))
  //mapLayer is a 'g' object that serves as a container for the SVG
  var mapLayer = svg.append('g');
  //Extract array of GeoJSON objects (one for each borough) from data
  let boroughs = data.features;
  /******* PANNING + ZOOMING FUNCTIONALITY  *******/
  //Transforms the svg object(s) included in the g object
  function zoomed({transform}) {
    mapLayer.attr("transform", transform);
  }
  //Generic zoom constant that triggers zoomed() when a zoom action is performed
  //scaleExtent() dictates the furthest the extent to which a user can zoom in our zoom out
  const zoom = d3.zoom()
    .scaleExtent([1, 40])
    .on("zoom", zoomed);
  //The line below is used to enable panning (dragging to move across the map)
  svg.call(zoom);
  //reset() function triggers when the "Reset" button is clicked
  //It resets the zoom level to the width, height of the SVG (hard-coded values)
  function reset() {
    svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity,
      d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
    );
  }
  /******* RENDERING OF BOROUGHS ON MAP + MAP STAYLING *******/
  //Append data to mapLayer and include some styling effects
  mapLayer.selectAll('path')
    .data(boroughs)
    //The two lines below append the path so that the rendered visualization is included
    .enter().append('path')
    .attr('d', path)
    //Add color styling to color the area of each borough and add a black stroke to outline the boroughs
    .style('fill', "#5ceda5")
    .attr("stroke", "#000");

  //Khannah - let's try to append the points to the maplayer 
  mapLayer.selectAll('circle')
    .data(stations)
    //append the path so that we can see the points
    .enter().append('circle')
    .attr('cx', d => projection([d.geometry[0], d.geometry[1]])[0])
  .attr('cy', d => projection([d.geometry[0], d.geometry[1]])[1])
  .attr('r', 1)
  .attr('fill', 'blue')
  .attr('opacity', 0.5)

  
  /******* TOOLTIP FUNCTIONALITY *******/
  //Assign the name of the borough to the tooltip text and render the tooltip where the user's cursor is
 mapLayer.on('touchmove mousemove', function(d) { console.log(d.target.__data__)
    //Use mouse event (represented by parameter d) to obtain the borough name, x-coordinate, and y-coordinate to create a tooltip
let name; 
if(d.target.__data__.properties.boro_name)
{
 name = d.target.__data__.properties.boro_name;
}
else if(d.target.__data__.properties.name)
{
   name = d.target.__data__.properties.name;
} 
          console.log(name);                                   
    const x = d.layerX;
    const y = d.layerY;
    //Invoke callout() function to generate or remove the tooltip. Note how the parameter provided to callout() is either null or not null
    tooltip
      .attr('transform', `translate(${x},${y})`)
      .call(callout, `${name}`);})
    //Remove tooltip when the mouse leaves a borough's area
    .on('touchend mouseleave', () => tooltip.call(callout, null));
  //Create tooltip variable to append to SVG object
  const tooltip = svg.append('g');
  //The lines below map functionality between the zoom buttons and the zoom constant defined earlier within generateMap()
  return Object.assign(svg.node(), {
    zoomIn: () => svg.transition().call(zoom.scaleBy, 2),
    zoomOut: () => svg.transition().call(zoom.scaleBy, 0.5),
    zoomReset: reset
  });

    //Assign the name of the borough to the tooltip text and render the tooltip where the user's cursor is
 /** mapLayer.on('touchmove mousemove', function(d) { console.log(d.target.__data__)
    //Use mouse event (represented by parameter d) to obtain the borough name, x-coordinate, and y-coordinate to create a tooltip
    const name = d.target.__data__.properties.name;
    const x = d.layerX;
    const y = d.layerY;
    //Invoke callout() function to generate or remove the tooltip. Note how the parameter provided to callout() is either null or not null
    tooltip
      .attr('transform', `translate(${x},${y})`)
      .call(callout, `${name}`);})
    //Remove tooltip when the mouse leaves a borough's area
    .on('touchend mouseleave', () => tooltip.call(callout, null));
  //Create tooltip variable to append to SVG object
  const tooltip1 = svg.append('g');
  //The lines below map functionality between the zoom buttons and the zoom constant defined earlier within generateMap()
  return Object.assign(svg.node(), {
    zoomIn: () => svg.transition().call(zoom.scaleBy, 2),
    zoomOut: () => svg.transition().call(zoom.scaleBy, 0.5),
    zoomReset: reset
  });**/
}
)}

function _12(html,chart)
{
  const form = html`<form>
  <button name="in" type="button">Zoom In</button>
  <button name="out" type="button">Zoom Out</button>
  <button name="reset" type="button">Reset</button>
</form>`;
  form.in.onclick = () => chart.zoomIn();
  form.out.onclick = () => chart.zoomOut();
  form.reset.onclick = () => chart.zoomReset();
  return form;
}


async function _chart(generateMap){return(
await generateMap()
)}

function _14(md){return(
md`#### Helper function for creating tooltip`
)}

function _callout(){return(
(g, value) => {
  if (!value) return g.style("display", "auto");
  //Append some properties to g object
  g
    .style("display", null)
    .style("pointer-events", "auto")
    .style("font", "10px sans-serif");
  //Create visual render of text box the borough's name will be created in
  const path = g.selectAll("path")
    .data([null])
    .join("path")
    .attr("fill", "white")
    .attr("stroke", "black");
  //Create text object + stayling
  const text = g.selectAll("text")
    .data([null])
    .join("text")
    .call(text => text
    .selectAll("tspan")
    .data((value + "").split(/\n/))
    .join("tspan")
    .attr("x", 0)
    .attr("y", (d, i) => `${i * 1.1}em`)
    .style("font-weight", (_, i) => i ? null : "bold")
    .html(function(d){
      return d}));

  //These variables will define the box our text gets generated in
  const {x, y, width: w, height: h} = text.node().getBBox();
  //Append the text
  text.attr("transform", `translate(${-w / 2},${15 - y})`);
  path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
}
)}

function _d3(require){return(
require("https://d3js.org/d3.v7.min.js")
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer("arr")).define("arr", _arr);
  main.variable(observer("fetchBikeData")).define("fetchBikeData", _fetchBikeData);
  main.variable(observer()).define(["md"], _5);
  main.variable(observer("stationInformation")).define("stationInformation", ["fetchBikeData"], _stationInformation);
  main.variable(observer("stations")).define("stations", _stations);
  main.variable(observer()).define(["stationInformation","stations"], _8);
  main.variable(observer()).define(["stations"], _9);
  main.variable(observer()).define(["md"], _10);
  main.variable(observer("generateMap")).define("generateMap", ["d3","DOM","stations","callout"], _generateMap);
  main.variable(observer()).define(["html","chart"], _12);
  main.variable(observer("chart")).define("chart", ["generateMap"], _chart);
  main.variable(observer()).define(["md"], _14);
  main.variable(observer("callout")).define("callout", _callout);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  return main;
}
