var dataPath = "/statisticsHPCAVE/logs/";
var imgsPath = "/statisticsHPCAVE/imgs/"

function fillPings(text){
  lines = text.split("\n");
  for ( var i = 0 ; i < lines.length ; i++ ){
    if (lines[i].split(",")[1] == "1"){
      jQuery("#mesu" + i.toString()).attr("src", imgsPath + "on" + i.toString() + ".svg");
    }else{
      jQuery("#mesu" + i.toString()).attr("src", imgsPath + "off" + i.toString() + ".svg");
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
    jQuery("#pourcentageBeta" ).html(betaPercent.toString());
    jQuery("#runningAlpha").html(    runningAlpha.toString());
    jQuery("#runningBeta").html(     runningBeta.toString());
    jQuery("#queuedAlpha").html(     queuedAlpha.toString());
    jQuery("#queuedBeta").html(      queuedBeta.toString());
  }
  else{}
}
function fillLastMonth(text){
  lines = text.split("\n");
  var nUsers = lines.length;
  var cpu = 0;
  for(var i = 0 ; i < lines.length ; i++){
    cpu = cpu + parseInt( (lines[i].split(","))[1] );
  }
  jQuery("#nUsersMonth").html(nUsers.toString());
  jQuery("#nCpuMonth").html(cpu.toString());
}
function fillLastYear(text){
  lines = text.split("\n");
  var nUsers = lines.length;
  var cpu = 0;
  for(var i = 0 ; i < lines.length ; i++){
    cpu = cpu + parseInt( (lines[i].split(","))[1] );
  }
  jQuery("#nUsersYear").html(nUsers.toString());
  jQuery("#nCpuYear").html(cpu.toString());
}
function fillInteruptions(text){
  lines = text.split("\n");
  html = "";
  for (var i = 0 ; i < lines.length ; i++){
    for (var j = 0 ; j < 6 ; j++){
      if (lines[1].split(",")[0].includes(j.toString())){
        html+="<b>mesu" + j.toString() + ": </b> " + lines[i].split(",")[1] + "<br>";
      }
    }
  }
}

jQuery.ajax({type:"GET", url: dataPath + "pings.csv",     success: fillPings});
jQuery.ajax({type:"GET", url: dataPath + "log.txt",       success: fillStatus});
jQuery.ajax({type:"GET", url: dataPath + "lastMonth.csv", success: fillLastMonth});
jQuery.ajax({type:"GET", url: dataPath + "lastYear.csv",  success: fillLastYear});
jQuery.ajax({type:"GET", url: dataPath + "uptimes.csv",   success: fillInterruptions});
