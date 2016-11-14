var parseDate = d3.time.format("%Y%m%d%H%M").parse;
var bisectDate = d3.bisector(function (d) { return d.date; }).left;

var xScale = d3.time.scale()
  .range([0, 390]);
var xScale_copy = d3.time.scale()
  .range([0, 390]);
var xScale2 = d3.time.scale()
  .range([0, 660]);

var yScale = d3.scale.linear().range([501, 0]);

var yScale2 = d3.scale.linear().range([122, 120]);

var color = d3.scale.ordinal().range(["#48A36D", "#E37756", "#E2AA59", "#33ccff", "#000000"]);

var xAxis = d3.svg.axis()
  .scale(xScale)
  .orient("bottom");

var xAxis2 = d3.svg.axis()
  .scale(xScale2)
  .orient("bottom");

var yAxis = d3.svg.axis()
  .scale(yScale)
  .orient("left");

var yAxis2 = d3.svg.axis()
  .scale(yScale2)
  .orient("left");

var line = d3.svg.line()
  .interpolate("basis")
  .x(function (d) { return xScale(d.date); })
  .y(function (d) { return yScale(d.rating); })
  .defined(function (d) { return d.rating; });
  
var line2 = d3.svg.line()
  .interpolate("basis")
  .x(function (d) { return xScale2(d.date); })
  .y(function (d) { return yScale2(d.rating); })
  .defined(function (d) { return d.rating; });

var maxY;

var svg = d3.select("#linechart").append("svg")
  .attr("width", 390)
  .attr("height", 501)
  .append("g")
  .attr("class", "chart")
  .attr("transform", "translate(" + 20 + "," + -20 + ")")


//for slider part-----------------------------------------------------------------------------------
var svg2 = d3.select("#linechartmain").append("svg")
  .attr("width", 660)
  .attr("height", 150)
  .append("g")
  .attr("class", "chart2")

var context = svg2.append("g")
  .attr("class", "context");//小框框下面的字

svg.append("defs")
  .append("clipPath")
  .attr("id", "clip")
  .append("rect")
  .attr("width", 390)
  .attr("height", 501); //控制不样line出格

svg2.append("defs")
  .append("clipPath")
  .attr("id", "clip2")
  .append("rect")
  .attr("width", 660)
  .attr("height", 120); //控制不样line出格

d3.csv("data4.csv", function (error, data) {
  color.domain(d3.keys(data[0]).filter(function (key) {
    return key !== "date";
  }));

  data.forEach(function (d) {
    d.date = parseDate(d.date);
  });

  var categories = color.domain().map(function (name) {
    return {
      name: name,
      values: data.map(function (d) {
        return {
          date: d.date,
          rating: +(d[name]),
        };
      }),
      visible: (name === "Average" ? true : false)
    };
  });

  xScale.domain(d3.extent(data, function (d) { return d.date; }));
  yScale.domain([0, 120]);
  xScale2.domain(d3.extent(data, function (d) { return d.date; }));

  //for slider part-----------------------------------------------------------------------------------

  var brush = d3.svg.brush()
    .x(xScale2)
    .on("brush", brushed);

  context.append("g")
    .attr("class", "x axis1")
    .attr("transform", "translate(0,120)")//小框下面的字
    .call(xAxis2);

  var contextArea = d3.svg.area()
    .interpolate("monotone")
    .x(function (d) { return xScale2(d.date); })
    .y0(0)
    .y1(120);
  context.append("path")
    .attr("class", "area")
    .attr("height", 120)
    .attr("width", 660)
    .attr("d", contextArea(categories[0].values))
    .attr("fill", "#F1F1F2");//整个小框框

  context.append("g")
    .attr("class", "x brush")
    .call(brush)
    .selectAll("rect")
    .attr("height", 120)
    .attr("fill", "#E6E7E8");  //小框框中的选择

  // draw line graph
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0,501)")
    .call(xAxis);//大框框下面的字

  svg2.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0,120)")
    .call(xAxis2);//大框框下面的字

  svg2.append("g")
    .attr("class", "y axis")
    .call(yAxis2)//大框的y
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0)
    .attr("x", -20)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Nitrate Level: mg/L");//大框上面的说明

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)//大框的y
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0)
    .attr("x", -20)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Nitrate Level: mg/L");//大框上面的说明

  var svg3 = d3.select("#legend").append("svg")
    .attr("width", 390)
    .attr("height", 120)
    .append("g")
    .attr("transform", "translate(-30,0)");

  var issue = svg3.selectAll(".issue")//边上的小按钮  
    .data(categories)
    .enter().append("g")
    .attr("class", "issue");

  var chart = svg.selectAll(".chart")
    .data(categories)
    .enter().append("g")
    .attr("class", "chart");

  var chart2 = svg2.selectAll(".chart2")
    .data(categories)
    .enter().append("g")
    .attr("width", 660)
    .attr("class", "chart2");

  chart.append("path")
    .attr("class", "line")
    .style("pointer-events", "none")
    .attr("id", function (d) {
      return "line-" + d.name.replace(" ", "").replace("/", "");
    })
    .attr("d", function (d) {
      return d.visible ? line(d.values) : null;
    })
    .attr("clip-path", "url(#clip)")
    .style("stroke", function (d) { return color(d.name); });

  chart2.append("path")
    .attr("class", "line")
    .style("pointer-events", "none")
    .attr("id", function (d) {
      return "line2-" + d.name.replace(" ", "").replace("/", "");
    })
    .attr("d", function (d) {
      return d.visible ? line2(d.values) : null;
    })
    .attr("clip-path", "url(#clip2)")
    .style("stroke", function (d) { return color(d.name); });

  //legends
  var legendSpace = 100 / categories.length;
      
  issue.append("rect")
    .attr("width", 16)
    .attr("height", 16)
    .attr("x", 35)
    .attr("y", function (d, i) { return 10 + i * (legendSpace); })
    .attr("fill", function (d) {
      return d.visible ? color(d.name) : "#F1F1F2";
    })
    .attr("stroke", function (d) {
      return color(d.name);
    })
    .attr("stroke-width", 5)
    .attr("class", "legend-box")
    .on("click", function (d) {
      d.visible = !d.visible;
      maxY = findMaxY(categories);
      yScale.domain([0, maxY]);

      svg.select(".y.axis")
        .transition()
        .call(yAxis);

      svg2.select(".y.axis")
        .call(yAxis2);

      chart.select("path")
        .transition()
        .attr("d", function (d) {
          return d.visible ? line(d.values) : null;
        })

      chart2.select("path")
        .transition()
        .attr("d", function (d) {
          return d.visible ? line2(d.values) : null;
        })

      issue.select("rect")
        .transition()
        .attr("fill", function (d) {
          return d.visible ? color(d.name) : "#F1F1F2";
        });
    })

    .on("mouseover", function (d) {

      d3.select(this)
        .transition()
        .attr("fill", function (d) { return color(d.name); });

      d3.select("#line-" + d.name.replace(" ", "").replace("/", ""))
        .transition()
        .style("stroke-width", 2.5);
    })

    .on("mouseout", function (d) {

      d3.select(this)
        .transition()
        .attr("fill", function (d) {
          return d.visible ? color(d.name) : "#F1F1F2";
        });

      d3.select("#line-" + d.name.replace(" ", "").replace("/", ""))
        .transition()
        .style("stroke-width", 1.5);

    })

  issue.append("text")
    .attr("x", 70)
    .attr("y", function (d, i) { return 25 + i * (legendSpace); })
    .text(function (d) { return d.name; });

  // Hover line 
  var hoverLineGroup = svg.append("g")
    .attr("class", "hover-line");

  var hoverLine = hoverLineGroup
    .append("line")
    .attr("id", "hover-line")
    .attr("x1", 10).attr("x2", 10)
    .attr("y1", 0).attr("y2", 360)
    .style("pointer-events", "none")
    .style("opacity", 1e-6);

  var hoverDate = hoverLineGroup
    .append('text')
    .attr("class", "hover-text")
    .attr("y", 40)
    .attr("x", 350)
    .style("fill", "#E6E7E8");

  function mousemove() {
    var mouse_x = d3.mouse(this)[0];
    var graph_x = xScale.invert(mouse_x);

    d3.select("#hover-line")
      .attr("x1", mouse_x)
      .attr("x2", mouse_x)
      .style("opacity", 1);

    var x0 = xScale.invert(d3.mouse(this)[0]),
      i = bisectDate(data, x0, 1),
      d0 = data[i - 1],
      d1 = data[i],
      d = x0 - d0.date > d1.date - x0 ? d1 : d0;
  };

  //for brusher of the slider bar at the bottom
  function brushed() {

    xScale.domain(brush.empty() ? xScale_copy.domain() : brush.extent()); // If brush is empty then reset the Xscale domain to default, if not then make it the brush extent 

    svg.select(".x.axis") 
      .transition()
      .call(xAxis);

    maxY = findMaxY(categories); 
    yScale.domain([0, maxY]); 

    svg.select(".y.axis") 
      .transition()
      .call(yAxis);

    chart.select("path") 
      .transition()
      .attr("d", function (d) {
        return d.visible ? line(d.values) : null;
      });
  };

});

function findMaxY(data) {
  var maxYValues = data.map(function (d) {
    if (d.visible) {
      return d3.max(d.values, function (value) {
        return value.rating;
      })
    }
  });
  return d3.max(maxYValues);
}