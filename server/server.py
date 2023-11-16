#pip install Flask
from flask import Flask, send_from_directory, render_template, jsonify
from flask import request as r
from dotenv import load_dotenv
import os
import shutil #for rmtree
import data

load_dotenv()

app = Flask(__name__, template_folder=os.getenv('WWW_FOLDER'))
app.config['WWW_FOLDER'] = os.getenv('WWW_FOLDER')
app.config['PUBLIC_FOLDER'] = os.getenv('PUBLIC_FOLDER')
app.config['PLOTS_FOLDER'] = "plots"
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_TYPE"] = "filesystem"
data.app = app
# reset old plots (last restart)
if os.path.exists(f"{app.config['PUBLIC_FOLDER']}/{app.config['PLOTS_FOLDER']}"):
    shutil.rmtree(f"{app.config['PUBLIC_FOLDER']}/{app.config['PLOTS_FOLDER']}")
os.mkdir(f"{app.config['PUBLIC_FOLDER']}/{app.config['PLOTS_FOLDER']}")

@app.route('/')
def route_index():
    return send_from_directory(app.config['WWW_FOLDER'], "index.html")
	
@app.route('/scales')
def route_scales():
    return render_template("scales.html", scales=data.dict_for_scales())

@app.route('/basics')
def route_basics_infos():
    return data.dict_for_basic()
    
@app.route('/planet')
def route_planet_infos():
    if "Planet" in r.args:
        data_planet = data.dict_for_web(str(r.args['Planet']))
        if data_planet is None:
            return jsonify({"message": "Planet not found"}), 404
        return data_planet
    else:
        return jsonify({"message": "Bad request. Missing Planet argument"}), 400

@app.route('/public/<path:filename>')
def get_resource(filename):
    #This route can deliver varius public files like css and site favicon
    return send_from_directory(app.config['PUBLIC_FOLDER'], filename)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=80)
