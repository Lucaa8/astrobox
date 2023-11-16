import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Utiliser le backend "Agg"
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import seaborn as sns
import numpy as np
import json
import uuid

# lire le fichier JSON
with open("data.json", 'r') as f:
    data_dict = json.loads(f.read())

# convertir le dictionnaire Python en dataframe
all_planets_df = pd.DataFrame.from_dict(data_dict)
data_dict = None
    
def gen_file():
    # Save the graph as a PNG file
    file_name = f"{uuid.uuid1()}.png"# make a UUID based on the host ID and current time
    plt.savefig(f"{app.config['PUBLIC_FOLDER']}/{app.config['PLOTS_FOLDER']}/{file_name}", dpi=300, bbox_inches='tight')
    plt.close()  # Fermer le graphique pour éviter les fuites de mémoire
    return f"public/{app.config['PLOTS_FOLDER']}/{file_name}"
    
def generate_mass_plot(planet_df):
    new_df = planet_df[['mass_x10_24_kg', 'planet']].reset_index(drop=True)
    
    # Tri du DataFrame par ordre croissant de la colonne "distance_moyenne_ua_average_distance_au"
    df_sorted = new_df.sort_values('mass_x10_24_kg')

    # Création du graphe interactif avec un bar plot en utilisant le DataFrame trié
    sns.barplot(x='mass_x10_24_kg', y='planet', data=df_sorted)  # Inversion des axes x et y
    #if(new_df["mass_x10_24_kg"][0]/new_df["mass_x10_24_kg"][1] > ?)
    plt.xscale('log')  # Change l'échelle de l'axe x en échelle logaritmique
    
    plt.xlabel('Masse (10_24 kg)')
    plt.ylabel('Planet')
    plt.title(f"Comparison of {planet_df['planet'][0]}'s and {planet_df['planet'][1]}'s Masses")
    
    return gen_file()
    
def generate_composition_plot(planet_df, comp_column):
    # Create the dataframe
    df = planet_df[[comp_column]].reset_index(drop=True)
    df = pd.json_normalize(df[comp_column])

    species = planet_df["planet"].item()
    components = df.columns.tolist()

    # Calculate the average for each component
    average = df.mean().tolist()

    big=[]
    micro=[]
    somme_autres=0
    for element in components:
        if df[element][0] > 0.2:
            big.append(element)
        else:
            micro.append(element)
            somme_autres += df[element][0]
    big.append('Autre')
    df['Autre'] = somme_autres

    


    palette=['#540BE0','#3271E0','#4DD9E0','#6F8BE0','#7FC9E0']
    # Sort micro components by their values in descending order
    micro_sorted = sorted(micro, key=lambda x: df[x][0], reverse=True)

    # Create the figure and axes for the main plot and the micro subplot
    fig, (ax_main, ax_micro) = plt.subplots(1, 2, figsize=(5, 5))
    fig.suptitle(f"{comp_column.replace('_', ' ').capitalize() if planet_df['planet'].item()!='Sun' else 'Composition'} of {species}")
    width = 0.5

    # Plot the stacked bar chart for "big" components
    bottom_main = 0
    for i, component in enumerate(big):
        p = ax_main.bar(species, df[component], width, label=component, bottom=bottom_main, color=palette[i])
        hexa_color=palette[i]
        bottom_main += df[component]

    ax_main.set_title('Main components')
    ax_main.set_ylabel("Percentage")
    ax_main.legend(loc="upper right")

    # Plot the stacked bar chart for sorted "micro" components in the micro subplot

    # Define base color for "Autre"
    rgb_color =  tuple(int(hexa_color[i:i+2], 16) for i in (1, 3, 5))

    r, g, b = rgb_color

    bottom_micro = 0
    num_micro = len(micro_sorted)
    for i, component in enumerate(micro_sorted):
        # Modify individual component values
        r =int(1.3 * r) %256
        g = int(1.3 * g) %256
        b += 0

        # Make sure values stay within the range [0, 255]
        r = max(0, min(r, 255))
        g = max(0, min(g, 255))
        b = max(0, min(b, 255))

        rgb_color = (r, g, b)
        hex_color = '#%02x%02x%02x' % rgb_color

        p = ax_micro.bar(species, df[component], width, label=component, bottom=bottom_micro, color=hex_color)
        bottom_micro += df[component]

    ax_micro.set_title("Autres")
    ax_micro.set_ylabel("Percentage")
    ax_micro.legend(loc="upper right")

    # Adjust the spacing between subplots
    fig.tight_layout()
    
    
    return gen_file()

def generate_gravity_plot(df_planet):
    new_df = df_planet[['gravity_m_s2', 'planet']].reset_index(drop=True)

    # liste des planètes
    planetes = new_df['planet']

    # force de gravité pour chaque planète (en m/s^2)
    gravite = new_df['gravity_m_s2']

    # force de saut d'un homme de 70kg (en Newton)
    force_saut = 70 * 2.45  # supposition

    # calcul de l'accélération due au saut
    acceleration_saut = force_saut / 70

    # estimation du temps de contact au sol pendant le saut
    temps_contact = 0.1  # supposition

    # calcul de la vitesse initiale au moment du saut
    vitesse_initiale = acceleration_saut * temps_contact

    # calcul de la hauteur de saut pour chaque planète (en mètres)
    hauteur_saut = [(vitesse_initiale**2 / (2 * g))*100 for g in gravite]

    plt.bar(planetes, hauteur_saut)
    plt.ylabel('Jump height (m)')
    plt.title(f"Jump height for a 70kg man on {df_planet['planet'][0]} compared to {df_planet['planet'][1]}")
    
    return gen_file()
    
def generate_diameter_plot(df_planet):
    new_df = df_planet[['diameter_km', 'planet']].reset_index(drop=True)
    
    # liste des planètes
    planetes = new_df['planet']

    # force de gravité pour chaque pla
    diametres = new_df['diameter_km']  # en kilomètres
    rayons = [d / 2 for d in diametres]
    couleurs = ['blue', 'red']

    fig, ax = plt.subplots()

    # Centrer les cercles
    centre = [0, 0]

    for i in range(len(planetes)):
        circle = plt.Circle(centre, rayons[i], color=couleurs[i], fill=True, alpha=0.5, label=planetes[i])
        ax.add_artist(circle)

    plt.xlim(-max(rayons)*1.1, max(rayons)*1.1)
    plt.ylim(-max(rayons)*1.1, max(rayons)*1.1)
    plt.gca().set_aspect('equal', adjustable='box')
    plt.xlabel('Diameters in kilometers')
    plt.xticks(rotation=90)
    plt.ylabel('Diameters in kilometers')
    plt.legend()
    plt.title(f"Comparison of {df_planet['planet'][0]}'s and {df_planet['planet'][1]}'s Diameters")

    return gen_file()
    
def generate_distance_plot(df_planet):
    new_df = df_planet[['average_distance_x10_6_km', 'planet']].reset_index(drop=True)
    
    # Tri du DataFrame par ordre croissant de la colonne "average_distance_x10_6_km"
    df_sorted = new_df.sort_values('average_distance_x10_6_km')

    # Création du graphe interactif avec un bar plot en utilisant le DataFrame trié
    sns.barplot(x='average_distance_x10_6_km', y='planet', data=df_sorted)  # Inversion des axes x et y
    plt.xlabel('Average Distance (x10^6 KM)')
    plt.ylabel('Planet')
    plt.title('Average Distance of Planets to the Sun')
    
    return gen_file()
    
def get_first_value(df, column):
    return df[column].item()
    
def dict_for_basic():
    list_parametre_basic = ['planet','mass_x10_24_kg','diameter_km','average_distance_x10_6_km']
    df = all_planets_df[list_parametre_basic].fillna(0)

    my_dict={}

    for i in range(len(df)):
        my_dict[df['planet'][i]] = {
            "Diameter" : df['diameter_km'][i],
            "Mass"     : df['mass_x10_24_kg'][i],
            "Distance" : df['average_distance_x10_6_km'][i]
        }

    return my_dict
    
def dict_for_web(planet_name): #E.G planet_name = "Venus"
    #planet                    -> Planet            : String  
    #ordre_order               -> Order             : Int
    #type_of_planet            -> Type              : String
    #discovery                 -> Discovery         : String
    #average_distance_x10_6_km -> Distance          : Int(0) if sun, Int*100'00 if Earth, else Path to plot.png 
    #diameter_km               -> Diameter          : Int if Earth, else Path to plot.png
    #mass_x10_24_kg            -> Mass              : Int if Earth, else Path to plot.png
    #density_kg_m3             -> Density           : Float
    #orbital_period_days       -> OrbitTime         : Float
    #rotation_period_h         -> RotationTime      : Float
    #gravity_m_s2              -> Gravity           : Int if Earth, else Path to plot.png
    #escape_velocity_km_s      -> EscapeSpeed       : Float
    #mean/lowest/highest_temp. -> Temp              : {Max, Mean, Min} dict
    #number_of_satellites      -> Satellites        : Int
    #albedo                    -> Albedo            : Float
    #atmospheric_composition   -> AtmComposition    : Path to plot.png
    #planet_composition        -> PlanetComposition : null if Sun, else Path to plot.png
    #ring_system               -> Rings             : Bool
    #global_magnetic_field     -> MagneticField     : Bool
    planet_df = all_planets_df[all_planets_df["planet"]==planet_name]
    if len(planet_df.index) == 0:
        return None
    planet_df = planet_df.head(1).fillna(0)
    #if the planet_name isnt Earth then we create a new df with Earth data + the given planet (to create comparison plots) else we dont because we wont need it
    planet_earth_df = pd.concat([planet_df, all_planets_df[all_planets_df["planet"]=="Earth"]], ignore_index=True) if planet_name!="Earth" else None 
    return {
        "Planet"            : get_first_value(planet_df, "planet"),
        "Order"             : int(get_first_value(planet_df, "ordre_order")),
        "Type"              : get_first_value(planet_df, "type_of_planet"),
        "Discovery"         : get_first_value(planet_df, "discovery"),
        "Distance"          : 0 if planet_name == "Sun" else generate_distance_plot(planet_earth_df) if planet_earth_df is not None else int(get_first_value(planet_df, "average_distance_x10_6_km"))*1000000,
        "Diameter"          : generate_diameter_plot(planet_earth_df) if planet_earth_df is not None else get_first_value(planet_df, "diameter_km"),
        "Mass"              : generate_mass_plot(planet_earth_df) if planet_earth_df is not None else get_first_value(planet_df, "mass_x10_24_kg"),
        "Density"           : get_first_value(planet_df, "density_kg_m3"),
        "OrbitTime"         : None if planet_name == "Sun" else get_first_value(planet_df, "orbital_period_year")*365,
        "RotationTime"      : get_first_value(planet_df, "rotation_period_h"),
        "Gravity"           : generate_gravity_plot(planet_earth_df) if planet_earth_df is not None else get_first_value(planet_df, "gravity_m_s2"),
        "EscapeSpeed"       : get_first_value(planet_df, "escape_velocity_km_s"),
        "Temp"              : {"Max": int(planet_df['highest_temperature_degc'].item()), "Mean": int(planet_df['mean_temperature_degc'].item()), "Min": int(planet_df['lowest_temperature_degc'].item())},
        "Satellites"        : int(get_first_value(planet_df, "number_of_satellites")),
        "Albedo"            : get_first_value(planet_df, "albedo"),
        "AtmComposition"    : generate_composition_plot(planet_df, "atmospheric_composition"),
        "PlanetComposition" : generate_composition_plot(planet_df, "planet_composition") if planet_name!="Sun" else None,
        "Rings"             : (True if get_first_value(planet_df, "ring_system") == "Yes" else False),
        "MagneticField"     : (True if get_first_value(planet_df, "global_magnetic_field") == "Yes" else False)
    }

def dict_for_scales():
    df = all_planets_df[['planet','diameter_km']].fillna(0).sort_values('diameter_km')
    scale_min = df[['diameter_km']].values[0].item();

    my_dict={}

    for i in range(len(df)):
        my_dict[df['planet'][i]] = df['diameter_km'][i]/scale_min

    return my_dict