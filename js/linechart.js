var parseDate = d3.time.format("%Y%m%d%H%M").parse;
var bisectDate = d3.bisector(function (d) { return d.date; }).left;

var xScale = d3.time.scale()
  .range([0, 550]);
var xScale_copy = d3.time.scale()
  .range([0, 550]);

var xScale2 = d3.time.scale()
    .range([0, 985]); // Duplicate xScale for brushing ref later

var yScale = d3.scale.linear().range([551, 0]);

var yScale2 = d3.scale.linear().range([134, 132]);

// 40 Custom DDV colors 
var color = d3.scale.ordinal().range(["#48A36D", "#E37756", "#E2AA59", "#33ccff"]);

var xAxis = d3.svg.axis()
  .scale(xScale)
  .orient("bottom");

  var xAxis2 = d3.svg.axis() // xAxis for brush slider
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
  .defined(function (d) { return d.rating; });  // Hiding line value defaults of 0 for missing data
var line2 = d3.svg.line()
  .interpolate("basis")
  .x(function (d) { return xScale2(d.date); })
  .y(function (d) { return yScale2(d.rating); })
  .defined(function (d) { return d.rating; });  // Hiding line value defaults of 0 for missing data
var maxY; // Defined later to update yAxis

var svg = d3.select("#linechart").append("svg")
  .attr("width", 550)
  .attr("height", 551) //height + margin.top + margin.bottom
  .append("g")
  .attr("class", "chart")
  .attr("transform", "translate(" + 20 + "," + -20 + ")")

// Create invisible rect for mouse tracking
svg.append("rect")
  .attr("width", 550)
  .attr("height", 551)
  .attr("x", 0)
  .attr("y", 0)
  .attr("id", "mouse-tracker")
  .style("fill", "white"); //大框

//for slider part-----------------------------------------------------------------------------------
var svg2 = d3.select("#linechartmain").append("svg")
  .attr("width", 985)
  .attr("height", 150) //height + margin.top + margin.bottom
  .append("g")
  .attr("class", "chart2")

var context = svg2.append("g") // Brushing context box container
  .attr("class", "context");//小框框下面的字

//append clip path for lines plotted, hiding those part out of bounds
svg.append("defs")
  .append("clipPath")
 .attr("id", "clip")
  .append("rect")
  .attr("width", 550)
  .attr("height", 551); //控制不样line出格

svg2.append("defs")
  .append("clipPath")
  .attr("id", "clip2")
  .append("rect")
  .attr("width", 985)
  .attr("height", 130); //控制不样line出格

//end slider part----------------------------------------------------------------------------------- 

d3.csv("data4.csv", function (error, data) {
  color.domain(d3.keys(data[0]).filter(function (key) { // Set the domain of the color ordinal scale to be all the csv headers except "date", matching a color to an issue
    return key !== "date";
  }));

  data.forEach(function (d) { // Make every date in the csv data a javascript date object format
    d.date = parseDate(d.date);
  });

  var categories = color.domain().map(function (name) { // Nest the data into an array of objects with new keys
    return {
      name: name, // "name": the csv headers except date
      values: data.map(function (d) { // "values": which has an array of the dates and ratings
        return {
          date: d.date,
          rating: +(d[name]),
        };
      }),
      visible: (name === "Nitrate" ? true : false) // "visible": all false except for economy which is true.
    };
  });

  xScale.domain(d3.extent(data, function (d) { return d.date; })); // extent = highest and lowest points, domain is data, range is bouding box
  
  yScale.domain([0, 130]);
  xScale2.domain(d3.extent(data, function (d) { return d.date; })); // Setting a duplicate xdomain for brushing reference later

  //for slider part-----------------------------------------------------------------------------------

  var brush = d3.svg.brush()//for slider bar at the bottom
    .x(xScale2)
    .on("brush", brushed);

  context.append("g") // Create brushing xAxis
    .attr("class", "x axis1")
    .attr("transform", "translate(0,130)")//小框下面的字
    .call(xAxis2);

  var contextArea = d3.svg.area() // Set attributes for area chart in brushing context graph
    .interpolate("monotone")
    .x(function (d) { return xScale2(d.date); }) // x is scaled to xScale2
    .y0(0) // Bottom line begins at height2 (area chart not inverted) 
    .y1(130); // Top line of area, 0 (area chart not inverted)

  //plot the rect as the bar at the bottom
  context.append("path")
    .attr("class", "area")
    .attr("height", 130)
    .attr("width", 985)
    .attr("d", contextArea(categories[0].values)) // pass first categories data .values to area path generator 
    .attr("fill", "#F1F1F2");//整个小框框

  //append the brush for the selection of subsection  
  context.append("g")
    .attr("class", "x brush")
    .call(brush)
    .selectAll("rect")
    .attr("height", 130) // Make brush rects same height 
    .attr("fill", "#E6E7E8");  //小框框中的选择


  //end slider part-----------------------------------------------------------------------------------

  // draw line graph
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0,551)")
    .call(xAxis);//大框框下面的字

  svg2.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0,130)")
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
    .attr("width", 550)
    .attr("height", 130) //height + margin.top + margin.bottom
    .append("g")
    .attr("transform", "translate(-30,0)");

  var issue =  svg3.selectAll(".issue")
    .data(categories) // Select nested data and append to new svg group elements
    .enter().append("g")
    .attr("class", "issue");//边上的小按钮   

  var chart = svg.selectAll(".chart")
    .data(categories) // Select nested data and append to new svg group elements
    .enter().append("g")
    .attr("class", "chart");

  var chart2 = svg2.selectAll(".chart2")
    .data(categories) // Select nested data and append to new svg group elements
    .enter().append("g")
    .attr("width",985)
    .attr("class", "chart2");    

  chart.append("path")
    .attr("class", "line")
    .style("pointer-events", "none") // Stop line interferring with cursor
    .attr("id", function (d) {
      return "line-" + d.name.replace(" ", "").replace("/", ""); // Give line id of line-(insert issue name, with any spaces replaced with no spaces)
    })
    .attr("d", function (d) {
      return d.visible ? line(d.values) : null; // If array key "visible" = true then draw line, if not then don't 
    })
    .attr("clip-path", "url(#clip)")//use clip path to make irrelevant part invisible
    .style("stroke", function (d) { return color(d.name); });
    
  chart2.append("path")
    .attr("class", "line")
    .style("pointer-events", "none") // Stop line interferring with cursor
    .attr("id", function (d) {
      return "line2-" + d.name.replace(" ", "").replace("/", ""); // Give line id of line-(insert issue name, with any spaces replaced with no spaces)
    })
    .attr("d", function (d) {
      return d.visible ? line2(d.values) : null; // If array key "visible" = true then draw line, if not then don't 
    })
    .attr("clip-path", "url(#clip2)")//use clip path to make irrelevant part invisible
    .style("stroke", function (d) { return color(d.name); });

  // draw legend
  var legendSpace = 100 / categories.length; // 450/number of issues (ex. 40)    

  issue.append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .attr("x", 35)
    .attr("y", function (d, i) { return 10 + i * (legendSpace); })  // spacing
    .attr("fill", function (d) {
      return d.visible ? color(d.name) : "#F1F1F2"; // If array key "visible" = true then color rect, if not then make it grey 
    })
    .attr("stroke", function (d) {
      return color(d.name); // If array key "visible" = true then color rect, if not then make it grey 
    })
    .attr("stroke-width", 5)

    .attr("class", "legend-box")

    .on("click", function (d) { // On click make d.visible 
      d.visible = !d.visible; // If array key for this data selection is "visible" = true then make it false, if false then make it true

      maxY = findMaxY(categories); // Find max Y rating value categories data with "visible"; true
      yScale.domain([0, maxY]); // Redefine yAxis domain based on highest y value of categories data with "visible"; true
      svg.select(".y.axis")
        .transition()
        .call(yAxis);

      svg2.select(".y.axis")
        .call(yAxis2);

      chart.select("path")
        .transition()
        .attr("d", function (d) {
          return d.visible ? line(d.values) : null; // If d.visible is true then draw line for this d selection
        })

      chart2.select("path")
        .transition()
        .attr("d", function (d) {
          return d.visible ? line2(d.values) : null; // If d.visible is true then draw line for this d selection
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
    .attr("y", function (d, i) { return 25 + i * (legendSpace); })  // (return (11.25/2 =) 5.625) + i * (5.625) 
    .text(function (d) { return d.name; });

  // Hover line 
  var hoverLineGroup = svg.append("g")
    .attr("class", "hover-line");

  var hoverLine = hoverLineGroup // Create line with basic attributes
    .append("line")
    .attr("id", "hover-line")
    .attr("x1", 10).attr("x2", 10)
    .attr("y1", 0).attr("y2", 360)
    .style("pointer-events", "none") // Stop line interferring with cursor
    .style("opacity", 1e-6); // Set opacity to zero 

  var hoverDate = hoverLineGroup
    .append('text')
    .attr("class", "hover-text")
    .attr("y", 40) // hover date text position
    .attr("x", 350) // hover date text position
    .style("fill", "#E6E7E8");

  var columnNames = d3.keys(data[0]) //grab the key values from your first data row
    //these are the same as your column names
    .slice(1); //remove the first column name (`date`);

  var focus = issue.select("g") // create group elements to house tooltip text
    .data(columnNames) // bind each column name date to each g element
    .enter().append("g") //create one <g> for each columnName
    .attr("class", "focus");

  focus.append("text") // http://stackoverflow.com/questions/22064083/d3-js-multi-series-chart-with-y-value-tracking
    .attr("class", "tooltip")
    .attr("x", 520) // position tooltips  
    .attr("y", function (d, i) { return (legendSpace) + i * (legendSpace); }); // (return (11.25/2 =) 5.625) + i * (5.625) // position tooltips       

  // Add mouseover events for hover line.
  d3.select("#mouse-tracker") // select chart plot background rect #mouse-tracker
    .on("mousemove", mousemove) // on mousemove activate mousemove function defined below
    .on("mouseout", function () {
      hoverDate
        .text(null) // on mouseout remove text for hover date

      d3.select("#hover-line")
        .style("opacity", 1e-6); // On mouse out making line invisible
    });

  function mousemove() {
    var mouse_x = d3.mouse(this)[0]; // Finding mouse x position on rect
    var graph_x = xScale.invert(mouse_x); // 

    //var mouse_y = d3.mouse(this)[1]; // Finding mouse y position on rect
    //var graph_y = yScale.invert(mouse_y);
    //console.log(graph_x);

    var format = d3.time.format('%b %Y'); // Format hover date text to show three letter month and full year

    hoverDate.text(format(graph_x)); // scale mouse position to xScale date and format it to show month and year

    d3.select("#hover-line") // select hover-line and changing attributes to mouse position
      .attr("x1", mouse_x)
      .attr("x2", mouse_x)
      .style("opacity", 1); // Making line visible

    // Legend tooltips // http://www.d3noob.org/2014/07/my-favourite-tooltip-method-for-line.html

    var x0 = xScale.invert(d3.mouse(this)[0]), /* d3.mouse(this)[0] returns the x position on the screen of the mouse. xScale.invert function is reversing the process that we use to map the domain (date) to range (position on screen). So it takes the position on the screen and converts it into an equivalent date! */
      i = bisectDate(data, x0, 1), // use our bisectDate function that we declared earlier to find the index of our data array that is close to the mouse cursor
      /*It takes our data array and the date corresponding to the position of or mouse cursor and returns the index number of the data array which has a date that is higher than the cursor position.*/
      d0 = data[i - 1],
      d1 = data[i],
      /*d0 is the combination of date and rating that is in the data array at the index to the left of the cursor and d1 is the combination of date and close that is in the data array at the index to the right of the cursor. In other words we now have two variables that know the value and date above and below the date that corresponds to the position of the cursor.*/
      d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    /*The final line in this segment declares a new array d that is represents the date and close combination that is closest to the cursor. It is using the magic JavaScript short hand for an if statement that is essentially saying if the distance between the mouse cursor and the date and close combination on the left is greater than the distance between the mouse cursor and the date and close combination on the right then d is an array of the date and close on the right of the cursor (d1). Otherwise d is an array of the date and close on the left of the cursor (d0).*/

    //d is now the data row for the date closest to the mouse position

    focus.select("text").text(function (columnName) {
      //because you didn't explictly set any data on the <text>
      //elements, each one inherits the data from the focus <g>

      return (d[columnName]);
    });
  };

  //for brusher of the slider bar at the bottom
  function brushed() {

    xScale.domain(brush.empty() ? xScale_copy.domain() : brush.extent()); // If brush is empty then reset the Xscale domain to default, if not then make it the brush extent 

    svg.select(".x.axis") // replot xAxis with transition when brush used
      .transition()
      .call(xAxis);

    maxY = findMaxY(categories); // Find max Y rating value categories data with "visible"; true
    yScale.domain([0, maxY]); // Redefine yAxis domain based on highest y value of categories data with "visible"; true

    svg.select(".y.axis") // Redraw yAxis
      .transition()
      .call(yAxis);

    chart.select("path") // Redraw lines based on brush xAxis scale and domain
      .transition()
      .attr("d", function (d) {
        return d.visible ? line(d.values) : null; // If d.visible is true then draw line for this d selection
      });
  };

}); // End Data callback function

function findMaxY(data) {  // Define function "findMaxY"
  var maxYValues = data.map(function (d) {
    if (d.visible) {
      return d3.max(d.values, function (value) { // Return max rating value
        return value.rating;
      })
    }
  });
  return d3.max(maxYValues);
}