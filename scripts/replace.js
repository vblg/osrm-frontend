#!/usr/bin/env node

'use strict'

const fs = require('fs')
const path = require('path')

// Define filepaths
const leafletOptions = path.join(__dirname, '..', 'src', 'leaflet_options.js')
const debug = path.join(__dirname, '..', 'debug', 'index.html')

// Read & Replace options
for (const filepath of [leafletOptions, debug]) {
  let options = fs.readFileSync(filepath, 'utf8')

  // Define Environment variables
  const ZOOM = process.env.OSRM_ZOOM || 13
  const LABEL = process.env.OSRM_LABEL || '�����'
  const CENTER = process.env.OSRM_CENTER || '45.0454463, 38.9709704'
  const BACKEND = process.env.OSRM_BACKEND || 'http://maps.etecar.ru/osrm'
  const LANGUAGE = process.env.OSRM_LANGUAGE || 'ru'
  const NOMINATIM = process.env.NOMINATIM_URL || 'http://maps.etecar.ru/nominatim/'

  // Edit Leaflet Options
  if (BACKEND) options = options.replace(/http[s]?:\/\/router\.project-osrm\.org/, BACKEND)
  if (LABEL) options = options.replace('Car (fastest)', LABEL)
  if (ZOOM) options = options.replace('zoom: 13', `zoom: ${ZOOM}`)
  if (LANGUAGE) options = options.replace(`language: 'en'`, `language: '${LANGUAGE}'`)
  if (CENTER) {
    const latLng = CENTER.split(/[, ]+/)
    const lat = latLng[0];
    const lng = latLng[1];
    const lnglat = [lng, lat].join(',')
    const latlng = [lat, lng].join(',')

    // Mapbox uses LngLat
    if (options.match('-122.4536, 37.796')) options = options.replace('-122.4536, 37.796', lnglat)
    // Leaflet uses LatLng
    else options = options.replace('38.8995, -77.0269', latlng)
  }

  if (NOMINATIM) options = options.replace(`serviceUrl: '//nominatim.openstreetmap.org/'`, `serviceUrl: '${NOMINATIM}'`)

  // Save Leaflet Options
  fs.writeFileSync(filepath, options)
}
