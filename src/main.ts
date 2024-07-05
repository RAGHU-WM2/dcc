import {
  getVenue,
  showVenue,
  TGetVenueOptions,
  MapView,
  MappedinMap,
  Mappedin,
  E_SDK_EVENT,  E_CAMERA_EVENT,

  OfflineSearch,
  TFloatingLabelAppearance,E_BLUEDOT_EVENT,E_BLUEDOT_STATE_REASON,PositionUpdater,E_BLUEDOT_STATE,STATE
} from "@mappedin/mappedin-js";
import "@mappedin/mappedin-js/lib/mappedin.css";
import "./style.css";
import { START } from "@mappedin/mappedin-js/renderer/internal/Mappedin.MultiFloorView";

// See Trial API key Terms and Conditions
// https://developer.mappedin.com/guides/api-keys
const options: TGetVenueOptions = {
  venue: "mappedin-demo-office",
  clientId: "5eab30aa91b055001a68e996",
  clientSecret: "RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1",
};

let mapView: MapView;
let venue: Mappedin;

// Search Start
let search: OfflineSearch;
let alphabeticalLocations: MappedinLocation[];

const directoryListElement = document.getElementById("directory")!;
const searchInput = document.getElementById(
  "locationsearch"
) as HTMLInputElement;

function render(locations: MappedinLocation[]) {
  directoryListElement.replaceChildren();
  locations.forEach((location) => {
    const item = document.createElement("li");
    item.textContent = `${location.name}`;
    directoryListElement.appendChild(item);
  });
}

searchInput.oninput = async (event: any) => {
  const value = event.target.value;
  if (value.length < 1) {
    render(alphabeticalLocations);
  } else {
    const results = await search.search(value);

    render(
      results
        .filter((r) => r.type === "MappedinLocation")
        .map((r) => r.object as MappedinLocation)
        .filter((l) => l.type === "tenant")
    );
  }
};

// Search End

const selectorDiv1 = document.getElementById("selectorDiv1")!;
const selectorDiv2 = document.getElementById("selectorDiv2")!;

const mapGroupSelectElement = document.createElement("select");
const mapLevelSelectElement = document.createElement("select");
mapLevelSelectElement.className = "custom-select";

selectorDiv1.appendChild(mapGroupSelectElement);
selectorDiv2.appendChild(mapLevelSelectElement);
selectorDiv1.style.cssText = "position: fixed; top: 2rem; left: 1rem;";
selectorDiv2.style.cssText = "position: fixed; top: 2rem; left: 37cm;";

// building levels selection start___________

function populateMapGroups() {
  mapGroupSelectElement.innerHTML = "";
  const mapGroups = venue.mapGroups;
  // Add each MapGroup to the select element.
  mapGroups.forEach((mg) => {
    const option = document.createElement("option");
    option.value = mg.id;
    option.text = mg.name;
    mapGroupSelectElement.appendChild(option);
  });
  // Get and sort maps by elevation.
  const maps = mapGroups[0].maps.sort((a, b) => b.elevation - a.elevation);
  populateMaps(maps);
}

mapGroupSelectElement.onchange = async (ev: Event) => {
  const mg = venue.mapGroups.find(
    (mg) => mg.id === mapGroupSelectElement.value
  )!;
  // Get and sort maps by elevation.
  const maps = mg.maps.sort((a, b) => b.elevation - a.elevation);
  // Display the ground floor.
  const map = maps[maps.length - 1];

  await mapView.setMap(map);
  populateMaps(maps);
};

function onLevelChange(event: Event) {
  const id = (event.target as HTMLSelectElement).value;
  mapView.setMap(id);
}

function populateMaps(maps: MappedinMap[]) {
  mapLevelSelectElement.innerHTML = "";
  mapLevelSelectElement.onchange = onLevelChange;

  // Add each map as an option to the level select.
  maps.forEach((map) => {
    const option = document.createElement("option");
    option.text = map.name;
    option.value = map.id;
    mapLevelSelectElement.add(option);
  });
  // Set the initial value of the level selector to the current map.
  mapLevelSelectElement.value = mapView.currentMap.id;
}
// building levels selection End______________

// Define floating label appearance type
type TFloatingLabelAppearance = {
  margin?: number;
  marker?: {
    backgroundColor?: { active?: string; inactive?: string };
    foregroundColor?: { active?: string; inactive?: string };
    size?: number;
    icon?: string;
    iconSize?: number;
    iconVisibilityThreshold?: number;
  };
  text?: {
    backgroundColor?: string;
    foregroundColor?: string;
    lineHeight?: number;
    maxWidth?: number;
    numLines?: number;
    size?: number;
  };
};






let positionData = {
  timestamp: Date.now(),
  coords: {
    accuracy: 5,
    latitude: 43.51905183293411,
    longitude: -80.53701846381122,
    floorLevel: 0,
  }
};

const staticPositionUpdater = new PositionUpdater();
setInterval(() => staticPositionUpdater.update(positionData), 10000);

async function init() {
  venue = await getVenue(options);
  console.log("venue", venue);
  
  venue.locations.forEach(location => {
    if (location.name === "Men's Washroom") {
      console.log("Location details:", location);
    }
  });
  


  mapView = await showVenue(document.getElementById("app")!, venue, {
    alpha: true,
    backgroundColor: "#DBDBDB",
    // multiBufferRendering: true,
    xRayPath: true,
  });
  populateMapGroups();
  // console.log(mapView);

  // LABLES START_____

  // Making polygons interactive allows them to respond to click and hover events.
// Function to create an element with specified tag, text content, and optional class
function createElement(tag: string, textContent: string, className?: string): HTMLElement {
  const element = document.createElement(tag);
  element.textContent = textContent;
  if (className) {
      element.classList.add(className);
  }
  return element;
}

// Function to populate details container with polygonDetails
function populateDetailsContainer(polygonDetails: any) {
  // Get a reference to the selectedPlaceContainer div
  const selectedPlaceContainer = document.getElementById('selectedPlaceContainer');

  if (selectedPlaceContainer) {
    // Clear any existing content
    selectedPlaceContainer.innerHTML = '';

    // Create details container
    const detailsContainer = document.createElement('div');
    detailsContainer.classList.add('details-container');

    detailsContainer.appendChild(createElement('h2', `${polygonDetails.name}`, 'detail-name'));
    detailsContainer.appendChild(createElement('p', `${polygonDetails.floorName}`, 'detail-floor'));

    detailsContainer.appendChild(createElement('p', `${polygonDetails.amenity}`, 'detail-amenity'));
    detailsContainer.appendChild(createElement('p', `${polygonDetails.type}`, 'detail-type'));

    // Append Directions button
    const directionsButton = document.createElement('button');
    directionsButton.setAttribute('id', 'directionbtn');
    directionsButton.innerHTML = '<b>Directions</b>';
    detailsContainer.appendChild(directionsButton);

    // Conditionally add icon based on polygonDetails.type
    if (polygonDetails.type === 'desk') {
        const deskIcon = document.createElement('img');
        deskIcon.setAttribute('src', 'path/to/desk-icon.png'); // Replace with actual path to desk icon
        deskIcon.setAttribute('alt', 'Desk Icon');
        detailsContainer.appendChild(deskIcon);
    } else if (polygonDetails.type === 'meetingroom') {
        const meetingRoomIcon = document.createElement('img');
        meetingRoomIcon.setAttribute('src', 'path/to/meetingroom-icon.png'); // Replace with actual path to meeting room icon
        meetingRoomIcon.setAttribute('alt', 'Meeting Room Icon');
        detailsContainer.appendChild(meetingRoomIcon);
    }

    // Append details container to selectedPlaceContainer
    selectedPlaceContainer.appendChild(detailsContainer);
}


}

mapView.on(E_SDK_EVENT.CLICK, ({ polygons }) => {
  // Show or hide containers based on the click event
  if (polygons.length > 0) {
    const clickedPolygon = polygons[0];
      mapView.setPolygonColor(clickedPolygon, "#2266FF");
    
    // Access location details if available
    if (clickedPolygon.locations && clickedPolygon.locations.length > 0) {
      const location = clickedPolygon.locations[0]; 
      const floorName = clickedPolygon.map.name; 
      const categories = location.categories[0]; 

      
      const polygonDetails = {
        id: clickedPolygon.id,
        name: location.name,      
        amenity: categories.name, 
        type: location.type,
        description: clickedPolygon.description,
        floorName: floorName,     
      };

      populateDetailsContainer(polygonDetails);
    } else {
      console.log("No location details found.");
    }

    // Hide search and categories containers
    document.querySelector('.search-container').classList.add('hidden');
    document.querySelector('.categoriescontainer').classList.add('hidden');
    // Show the main container
    document.getElementById('container').classList.remove('hidden');
    
  } else {
    mapView.clearAllPolygonColors();

    // Show search and categories containers
    document.querySelector('.search-container').classList.remove('hidden');
    document.querySelector('.categoriescontainer').classList.remove('hidden');
    // Hide the main container
    document.getElementById('container').classList.add('hidden');

    
  }
});


// console.log("mapView", mapView);


  // LABLES END

  // ICONS START
  const deskIcon = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17.5 3.00006H6.5C5.37366 2.93715 4.26817 3.32249 3.42502 4.07196C2.58187 4.82143 2.06958 5.87411 2 7.00006V13.0001C2.06958 14.126 2.58187 15.1787 3.42502 15.9282C4.26817 16.6776 5.37366 17.063 6.5 17.0001H17.5C18.6263 17.063 19.7318 16.6776 20.575 15.9282C21.4181 15.1787 21.9304 14.126 22 13.0001V7.00006C21.9304 5.87411 21.4181 4.82143 20.575 4.07196C19.7318 3.32249 18.6263 2.93715 17.5 3.00006V3.00006Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 17V21" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15.9004 21H7.90039" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
  const washroomIcon = `<?xml version="1.0" encoding="iso-8859-1"?>
<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg fill="#000000" height="800px" width="800px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 viewBox="0 0 512 512" xml:space="preserve">
<g>
	<g>
		<path d="M256,0c-9.22,0-16.696,7.475-16.696,16.696v478.609c0,9.22,7.475,16.696,16.696,16.696c9.22,0,16.696-7.475,16.696-16.696
			V16.696C272.696,7.475,265.22,0,256,0z"/>
	</g>
</g>
<g>
	<g>
		<path d="M105.739,44.522c-36.824,0-66.783,29.959-66.783,66.783c0,36.824,29.959,66.783,66.783,66.783
			s66.783-29.959,66.783-66.783C172.522,74.48,142.563,44.522,105.739,44.522z M105.739,144.696
			c-18.412,0-33.391-14.979-33.391-33.391c0-18.412,14.979-33.391,33.391-33.391s33.391,14.979,33.391,33.391
			C139.13,129.716,124.151,144.696,105.739,144.696z"/>
	</g>
</g>
<g>
	<g>
		<path d="M406.261,44.522c-36.824,0-66.783,29.959-66.783,66.783c0,36.824,29.959,66.783,66.783,66.783
			s66.783-29.959,66.783-66.783C473.043,74.48,443.085,44.522,406.261,44.522z M406.261,144.696
			c-18.412,0-33.391-14.979-33.391-33.391c0-18.412,14.979-33.391,33.391-33.391c18.412,0,33.391,14.979,33.391,33.391
			C439.652,129.716,424.673,144.696,406.261,144.696z"/>
	</g>
</g>
<g>
	<g>
		<path d="M189.217,211.478H22.261c-11.645,0-19.723,11.651-15.633,22.558l49.024,130.73v63.755
			c0,27.618,22.469,50.087,50.087,50.087c27.618,0,50.087-22.469,50.087-50.087v-63.755l49.024-130.73
			C208.939,223.133,200.865,211.478,189.217,211.478z M123.498,355.877c-0.702,1.874-1.063,3.86-1.063,5.862v66.783
			c0,9.206-7.49,16.696-16.696,16.696s-16.696-7.49-16.696-16.696v-66.783c0-2.002-0.361-3.988-1.063-5.862L46.353,244.87h118.773
			L123.498,355.877z"/>
	</g>
</g>
<g>
	<g>
		<path d="M505.372,355.877l-50.087-133.565c-2.443-6.516-8.673-10.833-15.633-10.833H372.87c-6.96,0-13.19,4.318-15.633,10.833
			L307.15,355.877c-4.089,10.903,3.985,22.558,15.633,22.558h33.391v50.087c0,27.618,22.469,50.087,50.087,50.087
			s50.087-22.469,50.087-50.087v-50.087h33.391C501.384,378.435,509.462,366.783,505.372,355.877z M439.652,345.043
			c-9.22,0-16.696,7.475-16.696,16.696v66.783c0,9.206-7.49,16.696-16.696,16.696s-16.696-7.49-16.696-16.696v-66.783
			c0-9.22-7.475-16.696-16.696-16.696h-25.995L384.44,244.87h43.642l37.565,100.174H439.652z"/>
	</g>
</g>
</svg>`;
  const spacesIcon = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg fill="#000000" width="800px" height="800px" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M11.349609 8C6.7758693 8 3 11.566488 3 16L3 16.414062C1.580715 17.02413 0.49636041 18.278358 0.13867188 19.810547C-0.43864859 22.284621 0.92343711 24.536596 3 25.476562L3 33C3 35.36797 4.1904816 37.464532 6 38.732422L6 43 A 1.0001 1.0001 0 0 0 7 44L11 44 A 1.0001 1.0001 0 0 0 12 43L12 40L38 40L38 43 A 1.0001 1.0001 0 0 0 39 44L43 44 A 1.0001 1.0001 0 0 0 44 43L44 38.732422C45.809518 37.464532 47 35.36797 47 33L47 25.494141C48.74513 24.715042 50 23.028851 50 21C50 18.962807 48.757485 17.203153 47 16.425781L47 16C47 11.566488 43.224132 8 38.650391 8L11.349609 8 z M 11.349609 10L38.650391 10C42.19465 10 45 12.701512 45 16L45 16.001953C44.838621 16.001885 44.676 16.007738 44.511719 16.023438C41.887643 16.273229 40 18.59556 40 21.171875L40 26L28 26C26.802849 26 25.735155 26.546205 25 27.388672C24.264845 26.546205 23.197151 26 22 26L10 26L10 21C10 18.252489 7.7251267 16.016761 5 16.003906L5 16C5 12.701512 7.8053511 10 11.349609 10 z M 13 13 A 1 1 0 0 0 12 14 A 1 1 0 0 0 13 15 A 1 1 0 0 0 14 14 A 1 1 0 0 0 13 13 z M 21 13 A 1 1 0 0 0 20 14 A 1 1 0 0 0 21 15 A 1 1 0 0 0 22 14 A 1 1 0 0 0 21 13 z M 29 13 A 1 1 0 0 0 28 14 A 1 1 0 0 0 29 15 A 1 1 0 0 0 30 14 A 1 1 0 0 0 29 13 z M 37 13 A 1 1 0 0 0 36 14 A 1 1 0 0 0 37 15 A 1 1 0 0 0 38 14 A 1 1 0 0 0 37 13 z M 17 17 A 1 1 0 0 0 16 18 A 1 1 0 0 0 17 19 A 1 1 0 0 0 18 18 A 1 1 0 0 0 17 17 z M 25 17 A 1 1 0 0 0 24 18 A 1 1 0 0 0 25 19 A 1 1 0 0 0 26 18 A 1 1 0 0 0 25 17 z M 33 17 A 1 1 0 0 0 32 18 A 1 1 0 0 0 33 19 A 1 1 0 0 0 34 18 A 1 1 0 0 0 33 17 z M 5.0175781 17.998047C6.7019134 17.995038 8 19.335835 8 21L8 31C8 32.64497 9.3550302 34 11 34L39 34C40.64497 34 42 32.64497 42 31L42 21.171875C42 19.57019 43.165247 18.15988 44.701172 18.013672C46.518895 17.839975 48 19.233039 48 21C48 22.404427 47.042353 23.554647 45.748047 23.890625 A 1.0001 1.0001 0 0 0 45 24.859375L45 33C45 35.773666 42.773666 38 40 38L10 38C7.2263339 38 5 35.773666 5 33L5 24.869141 A 1.0001 1.0001 0 0 0 4.25 23.902344C2.7409313 23.512907 1.675984 22.020505 2.0859375 20.263672C2.331147 19.213297 3.2238514 18.325633 4.2753906 18.083984C4.5291498 18.0257 4.7769588 17.998477 5.0175781 17.998047 z M 13 21 A 1 1 0 0 0 12 22 A 1 1 0 0 0 13 23 A 1 1 0 0 0 14 22 A 1 1 0 0 0 13 21 z M 21 21 A 1 1 0 0 0 20 22 A 1 1 0 0 0 21 23 A 1 1 0 0 0 22 22 A 1 1 0 0 0 21 21 z M 29 21 A 1 1 0 0 0 28 22 A 1 1 0 0 0 29 23 A 1 1 0 0 0 30 22 A 1 1 0 0 0 29 21 z M 37 21 A 1 1 0 0 0 36 22 A 1 1 0 0 0 37 23 A 1 1 0 0 0 38 22 A 1 1 0 0 0 37 21 z M 10 28L22 28C23.116666 28 24 28.883334 24 30L24 32L11 32C10.43497 32 10 31.56503 10 31L10 28 z M 28 28L40 28L40 31C40 31.56503 39.56503 32 39 32L26 32L26 30C26 28.883334 26.883334 28 28 28 z M 8 39.703125C8.6343547 39.893215 9.3053405 40 10 40L10 42L8 42L8 39.703125 z M 42 39.703125L42 42L40 42L40 40C40.69466 40 41.365645 39.893215 42 39.703125 z"/></svg>`;
  const meetingRoomIcon = `<?xml version="1.0" encoding="utf-8"?>

<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg fill="#000000" width="800px" height="800px" viewBox="-5.55 0 122.88 122.88" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  style="enable-background:new 0 0 111.78 122.88" xml:space="preserve">

<g>

<path d="M20.27,104.92c-1.86,0.9-4.09,0.12-4.98-1.74c-0.9-1.86-0.12-4.09,1.74-4.98c4.5-2.17,8.98-3.96,13.43-5.37 c4.48-1.42,8.99-2.46,13.53-3.12c2.31-0.34,4.62-0.57,6.93-0.71V85.3l-10.99-8.18c-0.4-0.53-0.69-1.13-0.86-1.76H21.68l0,0v-0.02 c-3.74,0-7.12-1.51-9.56-3.95c-2.44-2.44-3.95-5.82-3.95-9.56H8.15v0V45.47h-3.5h0v-0.02c-1.28,0-2.45-0.52-3.28-1.36 c-0.83-0.83-1.34-1.98-1.35-3.25L0,40.83v0h0.01v-3.82H0l0,0h0.01c0-1.29,0.52-2.45,1.36-3.28c0.83-0.83,1.98-1.34,3.25-1.35 l0.01-0.01h0h16.69h0v0.01c1.29,0,2.45,0.52,3.28,1.35v0.01c0.83,0.83,1.34,1.98,1.35,3.25l0.01,0.02v0h-0.01v3.82h0.01v0h-0.01 c0,1.29-0.52,2.46-1.35,3.28H24.6c-0.83,0.83-1.98,1.34-3.25,1.34l-0.02,0.02h0h-4.46v16.35v0h-0.02c0,1.3,0.55,2.5,1.43,3.39 c0.88,0.88,2.08,1.43,3.39,1.43v-0.02l0,0h2.86v-7.89c0-3.35,2.95-6.09,6.54-6.09H79.1c3.6,0,6.54,2.74,6.54,6.09v7.89h2.86h0v0.02 c1.3,0,2.51-0.55,3.39-1.43c0.88-0.88,1.43-2.09,1.43-3.39h-0.02v0V45.47h-2.86h0v-0.02c-1.28,0-2.44-0.52-3.28-1.36 c-0.83-0.83-1.34-1.98-1.35-3.25l-0.01-0.02v0h0.01v-3.82H85.8l0,0h0.01c0-1.29,0.53-2.45,1.36-3.28c0.83-0.83,1.98-1.34,3.25-1.35 l0.02-0.01h0h16.69h0v0.01c1.29,0,2.45,0.52,3.28,1.35v0.01c0.83,0.83,1.34,1.98,1.35,3.25l0.01,0.02v0h-0.01v3.82h0.01v0h-0.01 c0,1.28-0.52,2.45-1.36,3.28c-0.83,0.83-1.98,1.34-3.25,1.34l-0.01,0.02h0h-5.1v16.35v0h-0.02c0,3.74-1.51,7.12-3.95,9.56 c-2.44,2.44-5.82,3.95-9.56,3.95v0.02h0H71.56c-0.17,0.77-0.51,1.5-1,2.13l-10.92,7.45v4.05c3.02,0.16,6.03,0.5,9.05,1.02 c8.22,1.41,16.41,4.13,24.59,8.2c1.85,0.92,2.6,3.16,1.68,5.01c-0.92,1.85-3.16,2.6-5.01,1.68c-7.52-3.75-15.03-6.25-22.51-7.53 c-2.6-0.44-5.2-0.74-7.79-0.9v7.17c0,2.41-1.95,4.36-4.36,4.36c-2.41,0-4.36-1.95-4.36-4.36v-7.15c-1.96,0.12-3.92,0.33-5.88,0.61 c-4.08,0.59-8.2,1.55-12.33,2.86C28.54,101.28,24.39,102.93,20.27,104.92L20.27,104.92z M27.84,0h54.5c1.81,0,3.44,1.49,3.28,3.28 l-4.5,42.37c-0.19,1.79-1.48,3.28-3.28,3.28H32.56c-1.8,0-3.12-1.48-3.28-3.28L24.56,3.28C24.4,1.49,26.04,0,27.84,0L27.84,0z M50.22,75.36h10.15H50.22L50.22,75.36z M91.96,110.1c3.53,0,6.39,2.86,6.39,6.39c0,3.53-2.86,6.39-6.39,6.39 c-3.53,0-6.39-2.86-6.39-6.39C85.57,112.96,88.43,110.1,91.96,110.1L91.96,110.1z M55.48,110.1c3.53,0,6.39,2.86,6.39,6.39 c0,3.53-2.86,6.39-6.39,6.39s-6.39-2.86-6.39-6.39C49.09,112.96,51.95,110.1,55.48,110.1L55.48,110.1z M19,110.1 c3.53,0,6.39,2.86,6.39,6.39c0,3.53-2.86,6.39-6.39,6.39c-3.53,0-6.39-2.86-6.39-6.39C12.61,112.96,15.47,110.1,19,110.1L19,110.1z"/>

</g>

</svg>`;

  const colors = ["#A8577E", "pink", "green", "#219ED4", "tomato", "grey"];
  venue.categories.forEach((category, index) => {
    category.locations.forEach((location) => {
      if (location.polygons.length <= 0) {
        return;
      }

      let icon;
      switch (category.name) {
        case "Desk":
          icon = deskIcon;
          break;
        case "Meeting Room":
          icon = meetingRoomIcon;
          break;
        case "Washrooms":
          icon = washroomIcon;
          break;
        case "Open Spaces":
          icon = spacesIcon;
          break;
        default:
          icon = ""; 
      }


      const color = colors[index % colors.length];
      mapView.FloatingLabels.add(location.polygons[0], location.name, {
        appearance: {
          marker: {
            icon: icon,
            foregroundColor: {
              active: color,
              inactive: color,
            },
          },
        },
      });
    });
  });
  // ICONS END

  // Search START

  search = new OfflineSearch(venue);

  //sort them alphabetically.
  alphabeticalLocations = [
    ...venue.locations.filter((location) => location.type === "tenant"),
  ].sort((a, b) => (a.name < b.name ? -1 : 1));

  render(alphabeticalLocations);

  // Search End
  mapView.addInteractivePolygonsForAllLocations();

  
  //Enable Flat Labels for all locations.
  mapView.FlatLabels.labelAllLocations();

    // camera strat 

     //Making polygons interactive allows them to respond to click and hover events.
  mapView.addInteractivePolygonsForAllLocations();
  //Enable Flat Labels for all locations.
  mapView.FlatLabels.labelAllLocations();

  //Capture when the user clicks on a polygon.
  //The polygon that was clicked on is passed into the on method.
  mapView.on(E_SDK_EVENT.CLICK, ({ polygons }) => {
    //If no polygon was clicked, an empty array is passed.
    //Check the length to verify if the user cliked on one.
    if (polygons.length === 0) {
      //If no polygon was clicked, zoom out and show a top down view.
      mapView.Camera.set({
        rotation: 0,
        tilt: 0.0,
        zoom: 4000
      });
    } else {
      //If a polygon was clicked, zoom and focus on that polygon.
      mapView.Camera.focusOn(
        {
          polygons
        },
        {
          duration: 500
        }
      );
    }
  });

  //This event fires when the user starts adjusting the camera.
  mapView.Camera.on(E_CAMERA_EVENT.USER_INTERACTION_START, () => {
    console.log("USER_INTERACTION_START");
  });

  //This event fires when the user stops adjusting the camera.
  mapView.Camera.on(E_CAMERA_EVENT.USER_INTERACTION_END, () => {
    console.log("USER_INTERACTION_END");
  });

  //This event fires when the camera is adjusted by the user or programmatically.
  mapView.Camera.on(
    E_CAMERA_EVENT.CHANGED,
    ({ tilt, rotation, zoom, position }) => {
      console.log(
        `TILT: ${tilt}, ROTATION: ${rotation}, ZOOM: ${zoom}, POSITION: ${position}`
      );
    }
  );





  



}

init();
