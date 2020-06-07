import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';

let ready = false;
let registeredListener = null;

const registerListener = listener => {
  if (ready) {
    listener();
  } else {
    registeredListener = listener;
  }
};

const loadImage = (key, url) => {
  return new Promise(imageLoaded => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width * window.devicePixelRatio;
      canvas.height = image.height * window.devicePixelRatio;
      canvas.style.width = `${image.width}px`;
      canvas.style.height = `${image.height}px`;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      map.addImage(key, context.getImageData(0, 0, canvas.width, canvas.height), {
        pixelRatio: window.devicePixelRatio
      });
      imageLoaded()
    }
    image.src = url;
  });
};

const addLayer = (id, source, icon, text) => {
  const layer = {
    'id': id,
    'type': 'symbol',
    'source': source,
    'layout': {
      'icon-image': icon,
      'icon-allow-overlap': true,
    },
  };
  if (text) {
    layer.layout = {
      ...layer.layout,
      'text-field': text,
      'text-anchor': 'bottom',
      'text-offset': [0, -2],
      'text-font': ['Roboto Regular'],
      'text-size': 12,
    }
    layer.paint = {
      'text-halo-color': 'white',
      'text-halo-width': 1,
    }
  }
  map.addLayer(layer);
}

const calculateBounds = features => {
  if (features && features.length) {
    const first = features[0].geometry.coordinates;
    const bounds = [[...first], [...first]];
    for (let feature of features) {
      const longitude = feature.geometry.coordinates[0]
      const latitude = feature.geometry.coordinates[1]
      if (longitude < bounds[0][0]) {
        bounds[0][0] = longitude;
      } else if (longitude > bounds[1][0]) {
        bounds[1][0] = longitude;
      }
      if (latitude < bounds[0][1]) {
        bounds[0][1] = latitude;
      } else if (latitude > bounds[1][1]) {
        bounds[1][1] = latitude;
      }
    }
    return bounds;
  } else {
    return null;
  }
}

const element = document.createElement('div');
element.style.width = '100%';
element.style.height = '100%';

/*map = new mapboxgl.Map({
  container: this.mapContainer,
  style: 'https://cdn.traccar.com/map/basic.json',
  center: [0, 0],
  zoom: 1
});*/

const map = new mapboxgl.Map({
  container: element,
  style: {
  'version': 8,
  'sources': {
      'raster-tiles': {
      'type': 'raster',
      'tiles': [
          'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
          'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
          'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
          'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
      ],
      'tileSize': 256,
      'attribution': '© <a target="_top" rel="noopener" href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, © <a target="_top" rel="noopener" href="https://carto.com/attribution">CARTO</a>'
      }
  },
  'glyphs': 'https://cdn.traccar.com/map/fonts/{fontstack}/{range}.pbf',
  'layers': [
      {
      'id': 'simple-tiles',
      'type': 'raster',
      'source': 'raster-tiles',
      'minzoom': 0,
      'maxzoom': 22
      }
  ]
  },
  center: [0, 0],
  zoom: 1
});

map.addControl(new mapboxgl.NavigationControl());

map.on('load', () => {
  Promise.all([
    loadImage('background', 'images/background.svg'),
    loadImage('icon-marker', 'images/icon/marker.svg')
  ]).then(() => {
    ready = true;
    if (registeredListener) {
      registeredListener();
      registeredListener = null;
    }
  });
});

export default {
  element,
  map,
  registerListener,
  addLayer,
  calculateBounds,
};
