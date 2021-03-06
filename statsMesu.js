var dataPath = "/dashboardHPCAVE/data/";//Chemin pour les listes d'affectations et correspondances d'utilisateurs
var logsPath = "/dashboardHPCAVE/logs/";//Chemin pour les fichiers générés par la crontab
var imgsPath = "/dashboardHPCAVE/images/";//Chemin pour les images et ressources statiques

//Transform a usage percentage in a color for the badges
function percentToColor(percent){
    if(percent<10){return "#800"}
    if(percent>=10 && percent<25){return "#840"}
    if(percent>=25 && percent<40){return "#880"}
    if(percent>=40 && percent<55){return "#8a0"}
    if(percent>=55 && percent<70){return "#480"}
    if(percent>=70 && percent<100){return "#080"}
}

function fillPings(text){
    lines = text.split("\n");
    for ( var i = 0 ; i < lines.length ; i++ ){
	if(lines[i].length > 3){
	    if (lines[i].split(",")[1].includes("1")){
		jQuery("#mesu" + (i+1).toString()).attr("src", imgsPath + "on" + (i+1).toString() + ".svg");
	    }else{
		jQuery("#mesu" + (i+1).toString()).attr("src", imgsPath + "off" + (i+1).toString() + ".svg");
	    }
	}
    }
}

function fillStatus(text){
  lines = text.split("\n");
  if(lines.length>1){
    var alphaPercent = parseInt((parseFloat(lines[4].split("= ")[1].split(" ")[0])/1024*100));
    var betaPercent  = parseInt((parseFloat(lines[4].split("= ")[1].split(" ")[1])/3440*100));
    var runningAlpha = lines[3].split("= ")[1].split(" ")[0]
    var runningBeta  = lines[3].split("= ")[1].split(" ")[1]
    var queuedAlpha  = lines[2].split("= ")[1].split(" ")[0]
    var queuedBeta   = lines[2].split("= ")[1].split(" ")[1]
      jQuery("#pourcentageAlpha").html(alphaPercent.toString());
      jQuery("#pourcentageAlpha").parent().css("color", percentToColor(alphaPercent));
      jQuery("#pourcentageBeta" ).html(betaPercent.toString());
      jQuery("#pourcentageBeta").parent().css("color", percentToColor(betaPercent));
    jQuery("#runningAlpha").html(    runningAlpha.toString());
    jQuery("#runningBeta").html(     runningBeta.toString());
    jQuery("#queuedAlpha").html(     queuedAlpha.toString());
    jQuery("#queuedBeta").html(      queuedBeta.toString());
  }
  else{}
}
function fillLastMonth(text){
  lines = text.split("\n");
  var nUsers = lines.length - 1;
  var cpu = 0;
  for(var i = 0 ; i < lines.length - 1 ; i++){
    cpu = cpu + parseInt( (lines[i].split(","))[1] );
  }
  jQuery("#nUsersMonth").html(nUsers.toString());
  jQuery("#nCpuMonth").html(cpu.toString());
}
function fillLastYear(text){
  lines = text.split("\n");
  var nUsers = lines.length - 1;
  var cpu = 0;
    for(var i = 0 ; i < lines.length - 1 ; i++){
	console.log("ligne =", lines[i])
    cpu = cpu + parseInt( (lines[i].split(","))[1] );
  }
  jQuery("#nUsersYear").html(nUsers.toString());
  jQuery("#nCpuYear").html(cpu.toString());
}
function fillInterruptions(text){
  lines = text.split("\n");
  html = "";
  for (var i = 0 ; i < lines.length - 1 ; i++){
    for (var j = 0 ; j < 6 ; j++){
      if (lines[i].split(",")[0].includes(j.toString())){
          html+="<b>mesu" + j.toString() + ": </b> " + lines[i].split(",")[1].split(" days")[0] + " days<br>";
      }
    }
  }
  jQuery("#interruptions").html(html);
}

jQuery.ajax({type:"GET", url: logsPath + "pings.csv",     success: fillPings});
jQuery.ajax({type:"GET", url: logsPath + "log.txt",       success: fillStatus});
jQuery.ajax({type:"GET", url: logsPath + "lastMonth.csv", success: fillLastMonth});
jQuery.ajax({type:"GET", url: logsPath + "lastYear.csv",  success: fillLastYear});
jQuery.ajax({type:"GET", url: logsPath + "uptimes.csv",   success: fillInterruptions});



function usagePer(){

    //Read the laboratories list
    d3.csv(dataPath + "affectations.csv", function(labs){
	console.log("Successfully read the affectations file");

	//Read the user affectations: user/labo
	d3.text(dataPath + "users.csv", function(users){
	    users = d3.csvParseRows(users);
	    console.log("Successfully read the users file");

	    console.log(labs, users);
	    
	    //Read the lastYear usage file, in a csv format
	    d3.text(logsPath + "lastYear.csv", function(data){
		data = d3.csvParseRows(data);
		console.log("Successfully read the usage file for the year");
		console.log(data);
		tmp = [];
		tot = 0;
		for(var i = 0 ; i < data.length ; i++){
		    tmp.push(parseInt(data[i][1]));
		    tot+=parseInt(data[i][1]);
		}
		console.log(tmp, tot);
	    });

	    //Read the lastMonth usage file, in a csv format
	    d3.csv(logsPath + "lastMonth.csv", function(data){
		console.log("Successfully read the usage file for the month");
		//console.log(data);
	    });
	});
    });
}
usagePer();
