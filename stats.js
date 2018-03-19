/*
On définit les éléments svg et compagnie à l'intérieur des fonctions,
pour pouvoir en mettre plusieurs et rajouter du texte and co...
*/

//Prepare the svg element
var margin = {top: 20, right: 0, bottom: 70, left: 70},
  totalWidth = 800,
  totalHeight = 500,
  width = totalWidth - margin.left - margin.right,
  height = totalHeight - margin.top - margin.bottom;

//Create the container variables...
var container = d3.select("#svg-container")
var before    = d3.select("#svg-before")
var after     = d3.select("#svg-after");

//By default, show the status
status();

//Display the selected visualization depending on the result of the select elt
d3.select("select").on("change", function(event){
  var selection = d3.select( this ).property("value");
  container.selectAll("*").remove();
  before.selectAll("*").remove();
  after.selectAll("*").remove();
  d3.select("#pingStatus").style("display","none");
  d3.select("#changelog").style("display","none");
  //Adapt the visualization to the selection
  if( selection == "status" ){
    d3.select("#pingStatus").style("display","block");
    status();
  }
  else if( selection == "history" ){
    history();
  }
  else if( selection == "queues" ){
    visu_queues();
  }
  else if(selection == "intraDay"){
    intraDay();
  }
  else if(selection == "labAndUser"){
    userRepartition();
  }
  else if(selection == "changelog"){
    d3.select("#changelog").style("display","block");
    changelog();
  }
});


/*
The available visualizations:
1 - History : zoomable graph of the CPU usage, with maintenance operations
2 - Queues:   usage of the different queues throughout the life span of HPCave
3 - Users and labs: Repartition of the most intense "computer" labs and users
4 - status and indicators: Current dashboard
5 - week and day: radial expressions of the week means.
*/
function history(){

  //Define the svg element
  var svg = append_svg(container, 0, 0, totalWidth, totalHeight);
  svg.attr("id", "svg-full");

  //..., the main SVG group under it for dynamic content...
  var dynamicGroup = svg.append("g")
    .attr("class","dynamicGroup")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr('clip-path', 'url(#clip)');
  //...and the one for axises
  var staticGroup = svg.append("g")
    .attr("class","staticGroup")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv("/usage/usage.csv", function(data){

    //Keep a counter to check if some days are missing
    var currentDay = parseInt(data[0].day);
    missingDays = []
    extent = d3.extent(data, function (d) {return d.day;});
    for(var i = 0 ; i < data.length ; i++){
      if( parseInt(data[i].day) != currentDay ){
        while( currentDay < parseInt(data[i].day) ){
          missingDays.push(currentDay);
          currentDay +=1;
        }
      }
      currentDay=parseInt(data[i].day)+1;
    }
    //Add the missing days to the original data
    for(var i = 0 ; i < missingDays.length ; i++){
      obj = {
        "day": parseInt(missingDays[i]),
        "hours" : 0
      };
      data.push(obj);
    }
    //Sort the "augmented" data
    data.sort(function(x, y){
      return x.day > y.day;
    });
    //Make the mean:
    for(var i = 1 ; i < data.length-1 ; i++){
      data[i].hours = ( parseInt(data[i].hours) + parseInt(data[i+1].hours) + parseInt(data[i-1].hours) )/3;
    }

    //Create the scales
    var x = d3.scaleTime()
      .range([0, width])
      .domain(d3.extent(data, function (d) {
        return epochDayToDate(parseInt(d.day));
      }))
    var y = d3.scaleLinear()
      .range([height, 0])
      .domain([
        0,
        d3.max(data, function (d) {
          return parseInt(d.hours);
        })
      ])

    //And the axises
    var xAxis = d3.axisBottom(x)
        //.tickFormat(d3.timeFormat("%Y-%m-%d"))
        .tickFormat(function(date){
          if(date.getMinutes()) return d3.timeFormat('%H:%M')(date);
          if(date.getHours()) return d3.timeFormat('%H:%M')(date);
          if(date.getDay()&&date.getDate()!=1) return d3.timeFormat('%a %d')(date);
          if(date.getDate()!=1) return d3.timeFormat('%b %d')(date);
          if(date.getMonth()) return d3.timeFormat('%B')(date);
          return d3.timeFormat('%Y')(date);
        })
        .tickSize(-height);
    var yAxis = d3.axisLeft(y)
      .tickSize(-width);

    //Add the axis to the "group"
    staticGroup.append("g")
      .attr("class", "axis x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
    staticGroup.append("g")
      .attr("class", "axis y-axis")
      .call(yAxis);

    //Add the axis names
    staticGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "translate("+ -50 +","+(height/2)+")rotate(-90)")
      .text("CPU hours per day (h)");
    staticGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "translate("+ (width/2) +","+(height+50)+")")
      .text("Date");

    //Create the graph...
    var valueline = d3.line()
      .x(function (d) {
        return x( epochDayToDate(d.day) );
      })
      .y(function (d) {
        return y(d.hours);
      });

    //...and add it to the group
    dynamicGroup.append("path")
      .data([data])
      .attr("class", "line")
      .attr("d", valueline);

    //Add the maintenance periods
    d3.csv("/usage/changelog.csv", function(changes){
      stops = [];
      changes.forEach(function(d){
        obj = {
          "type": d.type,
          "start": parseInt(d.start),
          "end": parseInt(d.end),
          "description": d.description
        }
        if(obj.type=="off"){
          stops.push(obj);
        }
      });
      console.log(stops)

      dynamicGroup.selectAll(".stops")
        .data(stops)
        .enter().append("rect")
        .attr("class", "stops")
        .attr("x", function(d){
          return x(epochDayToDate(d.start));
        })
        .attr("y", 0)
        .attr("width", function(d){
          return x(epochDayToDate(d.end)) - x(epochDayToDate(d.start));
        })
        .attr("height", height)
        .style("fill", "rgba(255,0,0,0.15)")
        .on("mouseover", function(d,i){
          d3.select(this).style("fill", "rgba(255,0,0,0.35)");
          var format = d3.timeFormat("%Y-%m-%d")
          d3.select("#svg-after p").html(
            format(epochDayToDate(d.start)) + " to " + format(epochDayToDate(d.end)) + ": " + d.description
          );
        })
        .on("mouseout", function(d,i){
          d3.select(this).style("fill", "rgba(255,0,0,0.15)");
        })
    })

    //Add the "before" text ...
    d3.select("#svg-after").append("p").html("Hover the red areas to get information on the maintenance operations");
    //...and the "after" text
    d3.select("#svg-before").append("p").html("<b>This graph</b> displays the...");

    //Set up the zoom...
    var zoom = d3.zoom()
      .scaleExtent([1, 30])
      .translateExtent([[0,0],[width, height]])
      .extent([[50, 50], [width, height]])
      .on("zoom", zoomed);
    //...and add it to the dynamic group behavior...
    dynamicGroup.call(zoom);
    //...with the following response
    function zoomed() {
      var t  = d3.event.transform;
      //svg.selectAll(".line").attr("transform", "translate(" + t.x + "," + t.y + ")scale(" + t.k+ ")");
      //svg.selectAll(".stops").attr("transform", "translate(" + t.x + "," + t.y + ")scale(" + t.k+ ")");
      svg.selectAll(".line").attr("transform", "translate(" + t.x + ",0)scale(" + t.k+ ",1)");
      svg.selectAll(".stops").attr("transform", "translate(" + t.x + ",0)scale(" + t.k+ ",1)");
      svg.select(".x-axis").call(xAxis.scale(t.rescaleX(x)));
      //svg.select(".y-axis").call(yAxis.scale(t.rescaleY(y)));
    }



  });
}

function visu_queues(){

  //Define the svg element
  var svg = append_svg(container, 0, 0, totalWidth, totalHeight);
  svg.attr("id", "svg-full");

  //..., the main SVG group under it for dynamic content...
  var dynamicGroup = svg.append("g")
    .attr("class","dynamicGroup")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr('clip-path', 'url(#clip)');
  //...and the one for axises
  var staticGroup = svg.append("g")
    .attr("class","staticGroup")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv("/usage/queues_hist.csv", function(data) {
    dynamicGroup.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .style("fill","#fff");

    //Array containing the queues
    queues = []
    for (var key in data[0]){
      if(key!="epochDay"){
        queues.push(key);
      }
    }
    //Array containing the cleaned data
    newData = []
    data.forEach(function(d){
      obj = {};
      epo = parseInt(d.epochDay);
      if (epo > 15890 && epo < 17561 && epo%5==0){
        d.epochDay = epo/1;
        newData.push(d);
      }
    });

    //Get the maximum number of jobs which ran on a single day
    maxJobs = d3.max(newData, function(d){
      _m = 0;
      for (var key in d){
        if (key!="epochDay"){
          _m = Math.max(_m, parseInt(d[key]));
        }
      }
      return _m;
    });

    //scales
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    var z = d3.scaleLog().range([0,10]);
    var c = d3.scaleLog().range(["beige", '#009']);

    //add the domain to x and y scales as we now have data
    xDomain = d3.extent(newData, function(d){return parseInt(d.epochDay);})
    yDomain = [-1, Object.keys( newData[0] ).length -2]
    x.domain(xDomain);
    y.domain(yDomain);
    z.domain([1, maxJobs]);
    c.domain([1, maxJobs])

    //Define the axis
    var xAxis = d3.axisBottom()
      .scale(x)
      .ticks(10, "s")
      .tickSize(height)
    var yAxis = d3.axisLeft()
      .scale(y)
      .ticks(50)
      .tickFormat(function(d, i){
        if (Number.isInteger(d)){
          return queues[d];
        }
      })
      .tickSize(-width);

    //prepare the zoom
    var zoom = d3.zoom()
      .scaleExtent([1, 12])
      .translateExtent([[0,0],[width, height]])
      .extent([[0, 0], [width, height]])
      .on("zoom", zoomed);

    //Init the zoom to 0
    dynamicGroup.selectAll("g:not(.axiis)").attr("transform", d3.zoomIdentity);


    dynamicGroup.selectAll("g")
      .data(newData).enter()
      .append("g")
      .each(function(d, i) {
        D = []
        var i = 0;
        for (var key in d){
          if(key!="epochDay"){
            if(1){
              obj = [d.epochDay, i, d[key], key];
              D.push(obj);
              i++;
            }
          }
        }
        d3.select(this).selectAll("circle")
        .data(D).enter()
        .filter(function(tmp){ return parseInt(tmp[2])>1;})
        .append("circle")
        .style("fill", function(tmp){ return c(tmp[2]+1); } ) //Radius or color depends on time
        .style("opacity", function(tmp){ return 0.75-0.5*(tmp[2])/maxJobs } )
        .attr("r", function(tmp){ return z(tmp[2]+1); } )
        .attr("cx", function(tmp) { return x(tmp[0]) })
        .attr("cy", function(tmp) { return y(tmp[1]); });
      });

    //Add classes to the axis
    staticGroup.append("g").attr("class", "axiis xAxis").call(xAxis);
    staticGroup.append("g").attr("class", "axiis yAxis").call(yAxis);

    //Set up the zoom
    dynamicGroup.call(zoom);
    function zoomed() {
      var t  = d3.event.transform;
      dynamicGroup.selectAll("g:not(.axiis)").attr("transform", "translate(" + t.x + "," + t.y + ")scale(" + t.k+ ")");
      staticGroup.select(".xAxis").call(xAxis.scale(t.rescaleX(x)));
      staticGroup.select(".yAxis").call(yAxis.scale(t.rescaleY(y)));
    }
  })
}

function userRepartition(){
  //Read the laboratories list
  d3.csv("/usage/affectations.csv", function(labs){
    console.log("Successfully read the affectations file");

    //Read the user affectations: user/labo
    d3.csv("/usage/users.csv", function(users){
      console.log("Successfully read the users file");

      //Only keep the first affectation for users:
      users.forEach(function(d){
        delete d.aff2;
        delete d.aff3;
        delete d.aff4;
        delete d.aff5;
        d.cpu=0;
      })

      //Read the lastYear usage file, in a csv format
      d3.csv("/usage/lastYear.txt", function(data){
        console.log("Successfully read the usage file");

        console.log(labs, users, data)

        //Add the cpu time to the existing users
        data.forEach(function(d){
          for (var i = 0 ; i < users.length ; i++){
            if(users[i].user==d.user){
              users[i].cpu = parseInt(d.hours);
            }
          }
        })
        users.sort(function(a,b){return a.cpu < b.cpu})

        //Create a nested structure, according to lab affectation
        newData = d3.nest()
          .key(function(d){ return d.aff1 })
          .entries(users);
        //Add the total CPU to each element
        newData.forEach(function(d){
          var total = 0;
          d.values.forEach(function(user){
            total+=user.cpu;
          })
          d.cpu = total;
          labs.forEach(function(lab){
            if(lab.ID == d.key){
              d.name = lab.name;
            }
          })
        })
        //Sort the data
        newData.sort(function(a,b){return a.cpu < b.cpu})

        //Add the "before" text ...
        d3.select("#svg-after").append("p").html("Hover the arcs to get more information");
        d3.select("#svg-before").append("p").html("The summed CPU usage of each lab over the last 365 days is displayed on the left-side pie chart, while each user CPU usage is displayed on the right chart.");

        //Shared variables between the two visualisations
        var radius = 125;
        var color = d3.scaleOrdinal(d3.schemeCategory20b);

        //The pie of lab usage
        var svgLeft = append_svg(container, 0, 0, (totalWidth/2), (totalWidth/2) );
        svgLeft.attr("id", "svg-left");
        var groupLeft = svgLeft.append("g")
          .attr("transform", "translate(200,200)")
        var arcLeft = d3.arc()
          .innerRadius(0)
          .outerRadius(radius);
        var pieLeft = d3.pie()
          .value(function(d) { return d.cpu; })
          .sort(null);
        var pathLeft = groupLeft.selectAll('path')
          .data(pieLeft(newData))
          .enter()
          .append('path')
          .attr('d', arcLeft)
          .attr('fill', function(d){ return color(d.data.name); })
          .attr("class",function(d){ return "c_"+d.data.key })
          .on("mouseenter", onHover)
          .on("mouseout", onOut)
          .on("mouseover", function(x){
            //console.log(x);
            d3.select("#svg-after p").html(x.data.name + ": " + x.data.values.length + " users, " + x.data.cpu + " h.");
          })

        //The pie of users usage
        var svgRight = append_svg(container, 0, 0, (totalWidth/2), (totalWidth/2) );
        svgRight.attr("id", "svg-right");
        //and the main SVG group under it
        var groupRight = svgRight.append("g")
          .attr("transform", "translate(200,200)")
        var arcRight = d3.arc()
          .innerRadius(0)
          .outerRadius(radius);
        var pieRight = d3.pie()
          .value(function(d) { return d.cpu; })
          .sort(null);
        var pathRight = groupRight.selectAll('path')
          .data(pieRight(users))
          .enter()
          .append('path')
          .attr('d', arcRight)
          .attr('fill', function(x) {
            for(var i = 0 ; i < labs.length ; i++){
              if (labs[i].ID == x.data.aff1){
                return color(labs[i].name);
              }
            }
            return color(0);
          })
          .attr("class",function(d){ return "c_"+d.data.aff1 })
          .on("mouseenter", onHover)
          .on("mouseout", onOut)
          .on("mouseover", function(x){
            //console.log(x);
            d3.select("#svg-after p").html("This user computed " + x.data.cpu + " h.");
          })

        //Common behaviour on selection
        function onHover(x){
          var cl = d3.select(this).attr("class");
          d3.selectAll("svg path:not(."+cl+")").style("opacity", 0.65);
          //console.log(x.data.name);
        }
        function onOut(x){
          var cl = d3.select(this).attr("class");
          d3.selectAll("svg path:not(."+cl+")").style("opacity", 1);
        }


      })







    })

  })

}

function status(){

  //Transform a usage percentage in a color for the badges
  function percentColor(percent){
    if(percent<10){return "red"}
    if(percent>=10 && percent<25){return "orange"}
    if(percent>=25 && percent<40){return "yellow"}
    if(percent>=40 && percent<55){return "yellowgreen"}
    if(percent>=55 && percent<70){return "green"}
    if(percent>=70 && percent<100){return "brightgreen"}
  }

  //Pourcentages et nombre de jobs en cours pour les donnees
  function activate(text){
    lines = text.split("\n");
    if(lines.length>1){
      var alphaPercent = parseInt((parseFloat(lines[4].split("= ")[1].split(" ")[0])/1024*100));
      jQuery("#mesu-alpha").attr("src","https://img.shields.io/badge/usage-" + alphaPercent.toString()+ "%25-" + percentColor(alphaPercent) + ".svg");
      var betaPercent = parseInt((parseFloat(lines[4].split("= ")[1].split(" ")[1])/3440*100));
      jQuery("#mesu-beta").attr("src","https://img.shields.io/badge/usage-" + betaPercent.toString()+ "%25-" + percentColor(betaPercent) + ".svg");
      jQuery("#running-alpha").attr("src","https://img.shields.io/badge/running-" + lines[3].split("= ")[1].split(" ")[0] + "-blue.svg");
      jQuery("#queued-alpha").attr("src","https://img.shields.io/badge/queued-" + lines[2].split("= ")[1].split(" ")[0] + "-yellow.svg");
      jQuery("#running-beta").attr("src","https://img.shields.io/badge/running-" + lines[3].split("= ")[1].split(" ")[1] + "-blue.svg");
      jQuery("#queued-beta").attr("src","https://img.shields.io/badge/queued-" + lines[2].split("= ")[1].split(" ")[1] + "-yellow.svg");
    }
    else{
      jQuery("#warning").html('!PBS is currently down on HPCaVe servers!');
      for(var i = 0 ; i < 6 ; i++){
        jQuery("#mesu" + i.toString()).attr("src","https://img.shields.io/badge/mesu" + i.toString() + "-maintenance-orange.svg");
      }
    }
  }
  jQuery.ajax({type:"GET", url:"/usage/log.txt", success: activate});

  //Last month statistics
  function lastMonth(text){
    jQuery("#time3").html(text.split("\n")[0]);
    if(text.split("\n").length>3){
      var nUsers = text.split("\n").length - 1;
      jQuery("#nUsers").html(nUsers.toString());
      h=0;
      lines = text.split("\n");
      for(var i = 1 ; i < lines.length-1 ; i++){
        h = h + parseInt( (lines[i].split("|"))[1] );
      }
      jQuery("#hours").html(h.toString());
    }
  }
  jQuery.ajax({type:"GET", url:"/usage/lastMonth.txt",success: lastMonth});

  //Last year
  function lastYear(text){
    if(text.split("\n").length>2){
      var nUsers = text.split("\n").length;
      jQuery("#nUsersYear").html(nUsers.toString());
      h=0;
      lines = text.split("\n");
      for(var i = 0 ; i < lines.length-1 ; i++){
        h = h + parseInt( (lines[i].split("|"))[1] );
      }
      jQuery("#hoursYear").html(h.toString());
    }
  }
  jQuery.ajax({type:"GET", url:"/usage/lastYear.txt",success: lastYear});

  //Display the date
  function pingDate(text){
    var lines=text.split("\n");
    jQuery("#time1").html(lines[0]);
  }
  jQuery.ajax({type:"GET", url:"/usage/pingDate.txt", success: pingDate});

  //The pings
  function ping(text, id){
    if( text.split("\n").length>2 && text.indexOf("nreachable")==-1 ){
      jQuery("#mesu" + id.toString()).attr("src","https://img.shields.io/badge/mesu" + id.toString() + "-online-brightgreen.svg")
    }
  }
  function ping0(text){ ping(text, 0) }
  function ping1(text){ ping(text, 1) }
  function ping2(text){ ping(text, 2) }
  function ping3(text){ ping(text, 3) }
  function ping4(text){ ping(text, 4) }
  function ping5(text){ ping(text, 5) }
  jQuery.ajax({type:"GET", url:"/usage/ping0.txt",success: ping0});
  jQuery.ajax({type:"GET", url:"/usage/ping1.txt",success: ping1});
  jQuery.ajax({type:"GET", url:"/usage/ping2.txt",success: ping2});
  jQuery.ajax({type:"GET", url:"/usage/ping3.txt",success: ping3});
  jQuery.ajax({type:"GET", url:"/usage/ping4.txt",success: ping4});
  jQuery.ajax({type:"GET", url:"/usage/ping5.txt",success: ping5});

}

function intraDay(){

  //Define the svg element
  var svgLeft = append_svg(container, 0, 0, (totalWidth/2), (totalWidth/2) );
  svgLeft.attr("id", "svg-left");
  //and the main SVG group under it
  var groupLeft = svgLeft.append("g")
    .attr("transform", "translate(0,0)")
  d3.csv("/usage/quarterHours.csv", function(data){

    //Prepare the position (on the left)
    var tX = totalWidth/4,
      tY = totalWidth/4;

    //Prepare the angles
    angles = d3.range(0, 2 * Math.PI, Math.PI / 12);

    //Prepare the data array
    data.forEach(function(d, i){
      data[i].angle = angles[i];
      data[i].tot   = parseFloat(data[i].tot);
    });

    //Scale the radial axis
    y = d3.scaleLinear()
      .range([50,100])
      .domain(d3.extent(data, function(d){
        return d.tot;
      }))

    //Add the radial axis
    var gr = groupLeft.append("g")
      .attr("transform", "translate(" + tX + "," + tY + ")")
      .attr("class", "rAxis")
      .selectAll("g")
      .data(y.ticks(5).slice(1))
      .enter().append("g");
    gr.append("circle")
      .attr("r", y);
    gr.append("text")
      .attr("y", function(d) { return -y(d) - 4; })
      .attr("transform", "rotate(15)")
      .style("text-anchor", "middle")
      .text(function(d) { return d; });

    //And the angle axis
    var ga = groupLeft.append("g")
      .attr("transform", "translate(" + tX + "," + tY + ")")
      .attr("class", "aAxis")
      .selectAll("g")
      .data(d3.range(0, 360, 15))
      .enter().append("g")
      .attr("transform", function(d) { return "rotate(" + (-90+d) + ")"; });
    ga.append("line")
      .attr("x2", 100);
    ga.append("text")
      .attr("x", 100 + 6)
      .attr("dy", ".35em")
      .style("text-anchor", function(d) { return d < 270 && d > 90 ? "end" : null; })
      .attr("transform", function(d) {
        return d < 270 && d > 90 ? "rotate(180 " + (100 + 6) + ",0)" : null;
      })
      .text(function(d) {
        return d <= 180 ? d/15 + " A.M." : (d/15 - 12) + " P.M." ;
      });

    //Create the radial line
    var radial = d3.radialLine()
      .curve(d3.curveCardinalClosed)
      .angle(function(d){
        return d.angle;
      })
      .radius(function(d){
        return y(d.tot);
      })(data)

    groupLeft.append('path')
      .attr("transform", "translate(" + tX + "," + tY + ")")
      .attr('d', radial)
      .attr("fill", "red")
      .attr("stroke", "blue")
      .style("opacity", 0.5)
  })

  //Define the svg element
  var svgRight = append_svg(container, 0, 0, (totalWidth/2), (totalWidth/2) );
  svgRight.attr("id", "svg-right");
  //and the main SVG group under it
  var groupRight = svgRight.append("g")
    .attr("class","dynamicGroup")
    .attr("transform", "translate(0,0)");
  d3.csv("/usage/6HourUsage.csv", function(data){

    //Prepare the position (on the left)
    var tX = totalWidth/4,
      tY = totalWidth/4;

    //Prepare the angles
    angles = d3.range(0, 2 * Math.PI, Math.PI / 28);
    DaysOfWeek = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]

    //Prepare the data array
    data.forEach(function(d, i){
      data[i].angle = angles[i];
      data[i].tot   = parseFloat(data[i].tot);
    });

    //Scale the radial axis
    y = d3.scaleLinear()
      .range([50,100])
      .domain(d3.extent(data, function(d){
        return d.tot;
      }))

    //Add the radial axis
    var gr = groupRight.append("g")
      .attr("transform", "translate(" + tX + "," + tY + ")")
      .attr("class", "rAxis")
      .selectAll("g")
      .data(y.ticks(5).slice(1))
      .enter().append("g");
    gr.append("circle")
      .attr("r", y);
    gr.append("text")
      .attr("y", function(d) { return -y(d) - 4; })
      .attr("transform", "rotate(15)")
      .style("text-anchor", "middle")
      .text(function(d) { return d; });

    //And the angle axis
    var ga = groupRight.append("g")
      .attr("transform", "translate(" + tX + "," + tY + ")")
      .attr("class", "aAxis")
      .selectAll("g")
      .data(d3.range(0, 360, 360/7))
      .enter().append("g")
      .attr("transform", function(d) { return "rotate(" + (-90+d) + ")"; });
    ga.append("line")
      .attr("x2", 100);
    ga.append("text")
      .attr("x", 100 + 6)
      .attr("dy", ".35em")
      .style("text-anchor", function(d) { return d < 270 && d > 90 ? "end" : null; })
      .attr("transform", function(d) {
        return d < 270 && d > 90 ? "rotate(180 " + (100 + 6) + ",0)" : null;
      })
      .text(function(d,i) {
        return DaysOfWeek[i] + "" ;
      });

    //Create the radial line...
    var radial = d3.radialLine()
      .curve(d3.curveCardinalClosed)
      .angle(function(d){
        return d.angle + 2*Math.PI/7;
      })
      .radius(function(d){
        return y(d.tot);
      })(data)

    //...and add it to the plot
    groupRight.append('path')
      .attr("transform", "translate(" + tX + "," + tY + ")")
      .attr('d', radial)
      .attr("fill", "red")
      .attr("stroke", "blue")
      .style("opacity", 0.5)
  })

}

function changelog(){

}

/*
Litle Helper functions
*/
function epochDayToDate(epochDay){
  var d = new Date(0);
	d.setUTCSeconds(epochDay*24*3600);
	return d;
}
function append_svg(toElement, x, y, w, h){
  //Define the svg element, and append it to the element
  var svg = toElement.append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + w + " " + h)
    .attr("class", "svg-content")
  //...and its clipping path
  svg.append('defs')
    .append('clipPath')
    .attr('id', 'clip')
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', w - margin.left - margin.right)
    .attr('height', h - margin.top - margin.bottom);
  return svg;
}
