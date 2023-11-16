const basicInformation = {};

function getStyle(elementOrId) {

    let element = elementOrId;
    if(typeof elementOrId === "string") {
        element = document.getElementById(elementOrId);
    }

    return window.getComputedStyle(element);

}

function addPx(el1, el2) {
    return parseInt(el1, 10) + parseInt(el2, 10) + "px";
}

function subPx(el1, el2) {
    return parseInt(el1, 10) - parseInt(el2, 10) + "px";
}

function createTextInfo(text) {
    const pInfo = document.createElement("p");
    pInfo.className = "text-info";
    pInfo.innerHTML = text;
    return pInfo;
}

function displayBasics(planet) {

    const id = planet.id + "-infos";

    if(document.getElementById(id) !== null) {
        document.getElementById(id).remove();
        return;
    }

    const planetStyle = getStyle(planet);

    const divInfos = document.createElement("div");
    divInfos.id = id;
    divInfos.className = "div-infos";

    const pTitle = document.createElement("p");
    pTitle.textContent = planet.alt;
    pTitle.className = "text-info";
    pTitle.style.fontSize = "1.5vw";
    pTitle.style.textAlign = "center";

    divInfos.appendChild(pTitle);
    divInfos.appendChild(document.createElement("hr"));
    const infos = basicInformation[planet.alt];
    divInfos.appendChild(createTextInfo("Diameter: " + infos["Diameter"].toLocaleString() + " KM"));
    divInfos.appendChild(createTextInfo("Mass: " + infos["Mass"].toLocaleString() + "x10<sup>24</sup> KG"));
    //ne pas afficher pour le soleil lui-meme
    if(infos["Distance"] != "0") {
        divInfos.appendChild(createTextInfo("Distance (from Sun): " + (parseInt(infos["Distance"], 10) * 1000000).toLocaleString() + " KM"));
    }
    divInfos.appendChild(document.createElement("hr"));
    divInfos.appendChild(createTextInfo(planet.hasAttribute("selected") ? "Click to cancel" : "Click for more!"));

    document.querySelector("body").appendChild(divInfos);

    const divStyle = getStyle(divInfos);

    const left = addPx(subPx(planetStyle.left, parseInt(divStyle.width,10)/2), parseInt(planetStyle.width,10)/2);
    const top = subPx(subPx(addPx(getStyle("solar-system").top, planetStyle.top), parseInt(planetStyle.height,10)/2), divStyle.height);

    divInfos.style.left = parseInt(left,10) < 0 ? "0px" : left;
    divInfos.style.top = parseInt(top,10) < 0 ? "0px" : top;

}



window.onload = () => {

    document.getElementById("loading").style.display = "none";
    document.getElementById("solar-system").classList.remove("hide-planet");

    for(let planet of document.getElementById("solar-system").children) {

        //The sun doesnt have these attr.
        if(planet.hasAttribute("w")) {
            planet.style.width = planet.getAttribute("w");
            planet.style.left = planet.getAttribute("x");
            planet.style.top = planet.getAttribute("y");
        }

        planet.onmouseenter = () => {
            if(!planet.hasAttribute("selected")) {
                planet.style.transform =  (planet.id !== "sun" ? "translateY(-50%)" : "translate(-50%, -50%)") + " scale(1.3)";
            }
            displayBasics(planet);
        }

        planet.onmouseleave = () => {
            if(!planet.hasAttribute("selected")) {
                planet.style.transform = "";
            }
            displayBasics(planet);
        }

        planet.onmouseup = () => {
            if(isAnimed) {
                return;
            }
            if(!planet.hasAttribute("selected")) {
                setInfos(planet.alt);
                document.getElementById("bg-image").animate([{ width: "100vw" }, { width: "55vw" }], { duration: 500, fill: "forwards" });
                popoutPlanets(planet, () => {
                    document.getElementById("infos").style.zIndex = "0";
                });
            } else {
                document.getElementById("infos").style.zIndex = "";
                document.getElementById("bg-image").animate([{ width: "55vw" }, { width: "100vw" }], { duration: 500, fill: "forwards" });
                bringinPlanets(planet);
            }
        }

    }

    resetPlanetInfos();

    //Prevent the default close action the dialog to occure and replace it with a cool animation!
    const dialog = document.querySelector("dialog");
    document.querySelector('#close').onclick = function() {
        dialog.classList.add("hide");
        dialog.addEventListener("webkitAnimationEnd", function(){
            dialog.classList.remove("hide");
            dialog.close();
            dialog.removeEventListener("webkitAnimationEnd",  arguments.callee, false);
        }, false);
    };

    send("basics", {}, (status, response) => {

        if(status !== 200) {
            setAlertMessage(response["message"]);
            return;
        }

        for(let planet in response) {
            basicInformation[planet] = response[planet];
        }

        document.getElementById("infos").style.display = "";

    });
}