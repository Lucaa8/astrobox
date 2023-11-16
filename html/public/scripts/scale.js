function getAngle(html_element) {
    if(!html_element.hasAttribute("data-angle")) {
        return null;
    }
    const strAngle = html_element.getAttribute("data-angle");
    if(strAngle.includes("/")) {
        const values = strAngle.split("/");
        return (parseInt(values[0], 10)*Math.PI) / parseInt(values[1], 10);
    }
    return 0;
}

function setPosition(html_element, distance) {
    const angle = getAngle(html_element);
    const x = angle === null ? 0 : Math.cos(angle)*distance;
    const y = angle === null ? 0 : Math.sin(angle)*distance;
    html_element.style.left = (50 + x) + "vw";
    html_element.style.top = (50 - y) + "vh";
}

function computeScale(html_element) {
    return parseFloat(html_element.getAttribute("data-scale"))*zoomLevel*ratioScale;
}

function compute() {
    for(let image_body of document.body.querySelectorAll("div.celestial-body")) {
        image_body.style.transform = "translate(-50%, -50%) ";
        image_body.style.transform += "scale("+computeScale(image_body)+")";
        if(!image_body.hidden) {
            setPosition(image_body, image_body.getAttribute("data-distance")*zoomLevel);
        }
    }
    document.querySelector("label.scale-text").textContent = (4879/zoomLevel).toLocaleString(undefined, {maximumFractionDigits: 0}) + " KM";
}

let zoomLevel = 1;
let ratioScale = 1;

window.onload = () => {
    ratioScale = document.body.clientWidth/1920;
    document.addEventListener("wheel", function(e) {
        const deltaZoom = zoomLevel > 0.2 ? 0.02 : zoomLevel > 0.02 ? 0.005 : 0.001;
        if(e.deltaY < 0) {
            //zoom
            zoomLevel+=deltaZoom;
        } else {
            //unzoom
            zoomLevel-=deltaZoom;
        }
        if(zoomLevel >= 1) { zoomLevel = 1;}
        else if(zoomLevel <= 0.008) { zoomLevel = 0.008; }

        document.querySelector("div.warning-div").hidden = zoomLevel < 0.6 && zoomLevel !== 0.008;
        document.querySelector("div.more-info").hidden = zoomLevel !== 0.008;

        compute();
    });

    for(let im of document.querySelectorAll("div.celestial-body")) {
        const dv = document.querySelector(".planet-info");
        const overlay = im.querySelector("div");
        overlay.onmouseenter = () => {
            dv.hidden = false;
            document.getElementById("planet-name").textContent = im.querySelector("img").alt;
            document.getElementById("planet-diameter").textContent = "Diameter: " + (parseFloat(im.getAttribute("data-scale"))*4879).toLocaleString(undefined, {maximumFractionDigits:0}) + " KM";
        }
        overlay.onmouseleave = () => {
            dv.hidden = true;
            document.getElementById("planet-name").textContent = "";
        }
    }

    compute();

    const scaleOne = document.querySelector("div[data-scale=\"1.0\"]");
    const scaleWidth = parseInt(window.getComputedStyle(scaleOne).width, 10)*computeScale(scaleOne);
    const scaleElement = document.querySelector("div.scale-element");
    scaleElement.style.width = scaleWidth + "px";

}