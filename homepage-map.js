d3 = require("d3@^5.8");
topojson = require("topojson-client@3")
us = d3.json("https://unpkg.com/us-atlas@1/us/10m.json")

format = d3.format("");
color = d3.scaleQuantize()
    .domain([1, 10])
    .range(d3.schemeBlues[9])

data = Object.assign(new Map(await d3.csv("https://gist.githubusercontent.com/mbostock/682b782da9e1448e6eaac00bb3d3cd9d/raw/0e0a145ded8b1672701dc8b2a702e51c648312d4/unemployment.csv", ({id, rate}) => [id, +rate])), {title: "Unemployment rate (%)"});

legend = g => {
  const x = d3.scaleLinear()
      .domain(d3.extent(color.domain()))
      .rangeRound([20000, 200000]);

  g.selectAll("rect")
    .data(color.range().map(d => color.invertExtent(d)))
    .join("rect")
      .attr("height", 8)
      .attr("x", d => x(d[0]))
      .attr("width", d => x(d[1]) - x(d[0]))
      .attr("fill", d => color(d[0]));

  g.append("text")
      .attr("class", "caption")
      .attr("x", x.range()[0])
      .attr("y", -6)
      .attr("fill", "#000")
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .text(data.title);

  g.call(d3.axisBottom(x)
      .tickSize(13)
      .tickFormat(format)
      .tickValues(color.range().slice(1).map(d => color.invertExtent(d)[0])))
    .select(".domain")
      .remove();
}


const width = 960;
const height = 600;
const path = d3.geoPath();

const svg = d3.select(DOM.svg(width, height))
    .style("width", "100%")
    .style("height", "auto");

svg.append("g")
    .attr("transform", "translate(600,40)")
    .call(legend);

svg.append("g")
  .selectAll("path")
  .data(topojson.feature(us, us.objects.counties).features)
  .join("path")
    .attr("fill", d => color(data.get(d.id)))
    .attr("d", path)
  .append("title")
    .text(d => format(data.get(d.id)));

svg.append("path")
    .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-linejoin", "round")
    .attr("d", path);

return svg.node();
