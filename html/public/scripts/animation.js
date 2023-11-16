
//Keep track of the number of animation which has ended. If >= to 8 then all gifs have been moved. (all planets+sun without the selected one)
let animEndedCounter = 0;
let isAnimed = false;

function popoutPlanets(planetCenter, endAnimCallnack) {

    const styleCenter = getStyle(planetCenter);
    const viewportWidth = parseInt(getStyle(document.body).width, 10);
    isAnimed = true;

    for(let planet of document.getElementById("solar-system").children) {

        const styleCurrent = getStyle(planet);
        const strTransform = planet.classList.contains("planet") ? "translateX(0) " : "translateX(-50%) ";

        if(planet === planetCenter) {
            planet.setAttribute("selected", "yes");
            planet.animate([{ transform: strTransform + "translateY(-50%) scale(1)", left: styleCurrent.left, top: styleCurrent.top }, { transform: "translate(-50%, -50%) scale(2)", left: "27.5vw", top: 0 }], { duration: 500, fill: "none" }).onfinish = function(){
                planet.style.transform = "translate(-50%, -50%) scale(2)";
                planet.style.left = "27.5vw";
                planet.style.top  = 0;
            };
            continue;
        }

        const deltaX = (parseInt(styleCenter.left, 10) - parseInt(styleCurrent.left, 10))/viewportWidth;
        let directionOut = deltaX < 0 ? "100vw" : "-100vw";

        planet.animate([{ transform: strTransform + "translateY(-50%)" }, { transform: "translateX("+directionOut+") translateY(-50%)" }], { duration: 3500*Math.abs(deltaX), fill: "none" }).onfinish = () => {
            planet.style.transform = "translateX("+directionOut+") translateY(-50%)";
            if(++animEndedCounter >= 8) {
                isAnimed = false;
                animEndedCounter = 0;
                endAnimCallnack();
            }
        };
    }

}

function bringinPlanets(planetCenter) {

    isAnimed = true;

    for(let planet of document.getElementById("solar-system").children) {

        const styleCurrent = getStyle(planet);

        if(planet === planetCenter) {
            planet.removeAttribute("selected");
            let xDest = 0, yDest = 0, trX = "-50%";
            if(planet.classList.contains("planet")) {
                xDest = planet.getAttribute("x");
                yDest = planet.getAttribute("y");
                trX = "0";
            }
            planet.animate([{ transform: "translate(-50%, -50%) scale(2)", left: styleCurrent.left, top: styleCurrent.top }, { transform: "translate("+trX+", -50%) scale(1)", left: xDest, top: yDest }], { duration: 500, fill: "none" }).onfinish = function() {
                planet.style.transform = "";
                planet.style.left = xDest;
                planet.style.top  = yDest;
            };
            continue;
        }

        const strTransform = planet.classList.contains("planet") ? "translateX(0vw) " : "translateX(-50%) ";

        planet.animate([{ transform: styleCurrent.transform }, { transform: strTransform + "translateY(-50%)" }], { duration: 1500, fill: "none" }).onfinish = () => {
            planet.style.transform = "";
            if(++animEndedCounter >= 8) {
                isAnimed = false;
                animEndedCounter = 0;
                resetPlanetInfos();
            }
        };
    }

}