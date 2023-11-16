function toUrlEncoded(params) {

    let body = "";

    for (const key in params) {
        body += key + "=" + params[key] + "&";
    }

    return body.substring(0, body.length-1);

}


function setAlertMessage(message) {

    const dialForm = document.querySelector("dialog");
    const pText = dialForm.querySelector("p");

    pText.innerHTML = "";
    for(let line of message.split("<br>")) {
        pText.appendChild(document.createTextNode(line));
        pText.appendChild(document.createElement("br"));
    }

    dialForm.showModal();

}


function send(url, body, callback = (status, response) => {}) {

    let xhr = new XMLHttpRequest();

    xhr.open("GET", "/" + url + "?" + toUrlEncoded(body), true);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.send();

    xhr.onload = function () {
        if(xhr.status === 204 || xhr.getResponseHeader("content-type").includes("application/json")) {
            callback(xhr.status, xhr.status !== 204 ? JSON.parse(xhr.response) : undefined);
        } else {
            setAlertMessage("Oops, we cannot handle the server's response. Try again later.");
        }
    };

    xhr.onerror = function () {
        setAlertMessage("The server didnt responded... Please retry later.");
    }

}

