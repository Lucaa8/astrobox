const infos = {}
let plotsToLoad = 0;
let currentLoadedPlots = 0;

function setInfos(planet_name) {
    if(!(planet_name in infos)) {
        //loading
        document.getElementById("imgLoading").hidden = false;
        document.getElementById("pLoading").hidden = false;
        send("planet", {"Planet": planet_name}, (status, response) => {
            
            if(status !== 200) {
                const msg = "message" in response ? response["message"] : "Oops, something went wrong. Try again later"
                setAlertMessage(msg);
                return;
            }

            document.getElementById("imgLoading").hidden = true;
            document.getElementById("pLoading").hidden = true;
            infos[planet_name] = response;
            _setPlanetInfos(response);

        });
    } else {
        _setPlanetInfos(infos[planet_name]);
    }
}

function _getOrderName(intValue) {
    switch(intValue) {
        case 1 : return "First";
        case 2 : return "Second";
        case 3 : return "Third";
        default: return intValue + "th";
    }
}

function _setTempArray(min, mean, max) {
    const iTemp = document.getElementById("itemp");
    iTemp.querySelector("h2").hidden = false;
    const iTable = iTemp.querySelector("table");
    iTable.hidden = false;
    const tr = iTable.children[0].children[1];
    tr.children[0].textContent = min;
    tr.children[1].textContent = mean === 0 ? "Unknown" : mean;
    tr.children[2].textContent = max;
}

function _setPlot(html_element, src) {
    plotsToLoad++;
    html_element.hidden = false;
    html_element.src = src;
    html_element.onload = () => {
        currentLoadedPlots++;
        if(currentLoadedPlots >= plotsToLoad){
            currentLoadedPlots = 0;
            plotsToLoad = 0;
            for(let div of document.querySelectorAll("div.info-class")) {
                div.hidden = false;
            }
        }
    }
}

function _setText(html_element, text, inner) {
    html_element.hidden = false;
    if(inner) {
        html_element.innerHTML = text;
    } else {
        html_element.textContent = text;
    }
}

function _setInfo(html_div_id, is_text, info_text_or_url, inner_if_text=false) {
    const iDiv = document.getElementById(html_div_id);
    iDiv.querySelector("h2").hidden = false;
    iDiv.hidden = false;
    if(is_text) {
        _setText(iDiv.querySelector("p"), info_text_or_url, inner_if_text);
    } else {
        _setPlot(iDiv.querySelector("img"), info_text_or_url);
    }
}

function resetPlanetInfos() {
    document.getElementById("iplanetname").hidden = true;
    document.querySelectorAll("#infos > div > h1").forEach(el => el.hidden = true);
    const divs = document.querySelectorAll("div.info-class");
    for(let div of divs) {
        for(let child of div.children) {
            child.hidden = true;
        }
        div.hidden = true;
    }
}

function _setPlanetInfos(planet_infos_dict) {

   const isSun = planet_infos_dict["Order"] == 0;
   const isEarth = planet_infos_dict["Order"] == 3;


   _setText(document.getElementById("iplanetname"), planet_infos_dict["Planet"]);

   
   _setText(document.getElementById("ititle"), isSun ? "Our Star" : isEarth ? "Our planet (The third planet)" : "The " + _getOrderName(planet_infos_dict["Order"]) + " planet of the solar system");
   

   if(!isSun) {
    _setText(document.getElementById("itype"), planet_infos_dict["Type"]);
   }


   let discovery = planet_infos_dict["Discovery"];
   discovery = discovery.includes(",") ? discovery.split(", ") : [discovery.split(" ")[0]];
   _setInfo("idiscovery", true, isEarth ? "Earth was never formally 'discovered' because it was never an unrecognized entity by humans. However, its shared identity with other bodies as a \"planet\" is a historically recent discovery." : discovery.length < 2 ? discovery[0] : discovery[0] + " in " + discovery[1]);
   

   if(isEarth) {
    const dst = parseInt(planet_infos_dict["Distance"], 10);
    _setInfo("idistance", true, dst.toLocaleString() + " km.<br/>It's " + (dst/16950).toFixed(0) + " the distance between Paris, FR and Sydney, ASTL", true);
   } else if(!isSun) {
    _setInfo("idistance", false, planet_infos_dict["Distance"]);
   }


   if(isEarth) {
    _setInfo("idiameter", true, parseInt(planet_infos_dict["Diameter"], 10).toLocaleString() + " km");
   } else {
    _setInfo("idiameter", false, planet_infos_dict["Diameter"]);
   }


   if(isEarth) {
    _setInfo("imass", true, parseInt(planet_infos_dict["Mass"], 10) + "x10<sup>24</sup>" + " kg", true);
   } else {
    _setInfo("imass", false, planet_infos_dict["Mass"]);
   }


   _setInfo("idensity", true, planet_infos_dict["Density"] + " kg/m<sup>3</sup>", true);


   if(!isSun) {
    const days = parseFloat(planet_infos_dict["OrbitTime"], 10).toFixed(0);
    _setInfo("iorbitaltime", true, "A year on this planet is " + days + " days.<br/>I.e: This planet rotates completly around the Sun in " + days + " days.", true);
   }


   const isClockwise = planet_infos_dict["RotationTime"].startsWith("-");
   const rotTime = isClockwise ? planet_infos_dict["RotationTime"].substring(1) : planet_infos_dict["RotationTime"] + ".";
   if(isSun) {
    _setInfo("irottime", true, "The Sun turns on itself every " + rotTime);
   } else {
    _setInfo("irottime", true, "A day on " + planet_infos_dict["Planet"] + " last " + rotTime + "<br/>I.e: This planet turns on itself " + (isClockwise ? "(clockwise)" : "") + " in " + rotTime, true);
   }


   if(isEarth) {
    _setInfo("igravity", true, parseFloat(planet_infos_dict["Gravity"], 10) + " m/s<sup>2</sup>", true);
   } else {
    _setInfo("igravity", false, planet_infos_dict["Gravity"]);
   }


   _setInfo("iescapespeed", true, "You need to accelerate up to " + planet_infos_dict["EscapeSpeed"] + " km/s to escape from " + (isSun ? "the Sun" : "this planet") + "'s gravity and be free.", true);
   
   
   const tempData = planet_infos_dict["Temp"];
   _setTempArray(tempData["Min"], tempData["Mean"], tempData["Max"]);


   if(!isSun) {
    const satCount = parseInt(planet_infos_dict["Satellites"], 10);
    _setInfo("isatnumber", true, satCount > 0 ? "This planet has " + satCount + " natural satellites." : "This planet doesn't have any natural satellites.");
   }


   if(!isSun) {
    _setInfo("ialbedo", true, "This planet reflects " + parseFloat(planet_infos_dict["Albedo"]*100, 10).toFixed(0) + "% of the received light.<br>It can make the planet easier to see in the sky (not true all the time).", true);
   }


   _setInfo("iatmcomp", false, planet_infos_dict["AtmComposition"]);


   if(!isSun) {
    _setInfo("iplanetcomp", false, planet_infos_dict["PlanetComposition"]);
   }


   _setInfo("irings", true, (planet_infos_dict["Rings"] ? "Yes" : "No"));


   _setInfo("imagneticfield", true, (planet_infos_dict["MagneticField"] ? "Yes" : "No"));
   
}