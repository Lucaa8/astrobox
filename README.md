# AstroBox

## Objectif
Notre projet de visualisation permettera à des jeunes avides de découverte sur le sujet immensément grand qu'est l'espace de parcourir notre système solaire afin d'en apprendre plus sur ses caractéristiques.

## Guide de mise en place

- Git clone le répository
- Aller dans le dossier "server"
- Ouvrir une console à cet emplacement
  - `python -m venv venv`
  - `.\venv\Scripts\activate`
  - `pip install -r requirements.txt`
- Toujours dans le dossier "server" puis dans le venv
  - `python server.py`
- Accéder à l'adresse http://localhost/


## Disclamer
Il est possible que sur certaines machines, ou certains navigateurs, les animations des planètes qui sortent de l'écran soit un peu bugguée. Ceci est produit car à la fin de l'animation la position finale est reset à la position de départ puis très rapidement après le style de la planète reprend la position finale. Cela peut visuellement s'apparenter à une "téléportation" / "glitch" soudain(e).

