

var map;

function resetMap() {
    initMap();
}

function initMap() {
    map = new google.maps.Map(d3.select("#map").node(), {
        zoom: 12,
        center: { lat: 41.95, lng: -93.63 },
        mapTypeId: google.maps.MapTypeId.TERRAIN,
    });

    map.data.loadGeoJson('google.json');

    map.data.setStyle(function (feature) {
        var color = 'grey';
        if (feature.getProperty('isColorful')) {
            color = feature.getProperty('color');
        }
        return /** @type {google.maps.Data.StyleOptions} */({
            fillColor: color,
            strokeColor: color,
            strokeWeight: 1
        });
    });

    map.data.addListener('click', function (event) {
        if (event.feature.getProperty('isColorful')) {
            event.feature.setProperty('isColorful', false);
        }
        else event.feature.setProperty('isColorful', true);
    });

    map.data.addListener('mouseover', function (event) {
        map.data.revertStyle();
        map.data.overrideStyle(event.feature, { strokeWeight: 2 });
    });
    map.data.addListener('mouseout', function (event) {
        map.data.revertStyle();
    });

//end of google-map
//add a site layer to google-map

d3.json("stations.json", function (error, data) {
    if (error) throw error;
    var overlay = new google.maps.OverlayView();

    overlay.onAdd = function () {
        var layer = d3.select(this.getPanes().overlayLayer).append("div")
            .attr("class", "stations");

        // Draw each marker as a separate SVG element.
        // We could use a single SVG, but what size would it have?
        overlay.draw = function () {

            var projection = this.getProjection(),
                padding = 200;

            var marker = layer.selectAll("svg")
                .data(d3.entries(data))
                .each(transform) // update existing markers
                .enter().append("svg")
                .each(transform)
                .attr("class", "marker");

            $(document).ready(function () {
                $("#slider").slider({
                    value: 1991,
                    min: 1991,
                    max: 2012,
                    step: 1,
                    slide: function (event, ui) {
                        $("#year").val(ui.value);
                        redraw(ui.value.toString());
                    }
                });
                $("#year").val($("#slider").slider("value"));
                var labels = marker.append("svg:g")
                    .attr("id", "labels");
                var xy = d3.geo.equirectangular()
                    .scale(850);
                var scalefactor = 50. / 50.;// write a linear function 

                d3.csv("data.csv", function (csv) {

                    marker
                        .append("text")
                        .attr("x", padding + 10)
                        .attr("y", padding)
                        .attr("dy", ".31em")
                        .attr("class","me")
                        .text(function (d) { return d.key; });
                        
                    marker
                        .data(csv)
                        .append("circle")
                        .attr("r", function (d) { return (+d["1990"]) * scalefactor; })
                        .attr("cx", padding)
                        .attr("cy", padding)
                        .attr("fill", function (d) { return d["color"]; })
                        .attr("class","circle");

                    marker
                        .data(csv).append("circle")
                        .attr("r", 1).attr("fill", "#FFF")
                        .attr("cx", padding)
                        .attr("cy", padding);


                    //   labels.selectAll("labels")
                    //       .data(csv)
                    //         .append("svg:text")
                    //         .attr("x", function(d, i) { return xy([+d["longitude"],+d["latitude"]])[0]; })
                    //         .attr("y", function(d, i) { return xy([+d["longitude"],+d["latitude"]])[1]; })
                    //         .attr("dy", "0.3em")
                    //         .attr("text-anchor", "middle")
                    //         .text(function(d) { return Math.round(d["1990"]); });
                });
                function redraw(year) {
                    marker.selectAll(".circle")
                        .transition()
                        .duration(850).ease("linear")
                        .attr("r", function (d) { return (+d[year]) * scalefactor; })
                        .attr("title", function (d) { return d["country"] + ": " + Math.round(d[year]); });

                    labels.selectAll("text")
                        .text(function (d) { return Math.round(d[year]); });
                }
            });

            function transform(d) {
                d = new google.maps.LatLng(d.value[1], d.value[0]);
                d = projection.fromLatLngToDivPixel(d);
                return d3.select(this)
                    .style("left", (d.x - padding) + "px")
                    .style("top", (d.y - padding) + "px");
            }
        };
    };
    overlay.setMap(map);
});
}

