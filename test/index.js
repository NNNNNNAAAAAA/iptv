const util = require('../helpers/util')
const axios = require('axios')

const errorLog = 'error.log'
const config = {
  timeout: 60000,
  delay: 200
}

let stats = {
  tests: 0,
  channels: 0,
  failures: 0
}

const http = axios.create({ timeout: config.timeout })
http.defaults.headers.common["User-Agent"] = "VLC/2.2.4 LibVLC/2.2.4"

async function test() {

  stats.tests++

  const playlist = util.parsePlaylist('index.m3u')
  
  const countries = playlist.items

  for(let country of countries) {

    if (skipPlaylist(country.url)) {
	    continue;
    }

    console.log(`Checking '${country.url}'...`)

    const playlist = util.parsePlaylist(country.url)

    for(let item of playlist.items) {

      await new Promise(resolve => {
        setTimeout(resolve, config.delay)
      })

      stats.channels++

      try {

        await http.get(item.url)

        continue

      } catch (err) {

        stats.failures++

        writeToLog(country.url, err.message, item.url)

      }

    }
  }

  if(stats.failures === 0) {

    console.log(`OK (${stats.tests} tests, ${stats.channels} channels)`)
    
  } else {

    console.log(`FAILURES! (${stats.tests} tests, ${stats.channels} channels, ${stats.failures} failures)`)

  }

}

console.log('Test is running...')

test()

function writeToLog(country, msg, url) {
  var now = new Date()
  var line = `${country}: ${msg} '${url}'`
  util.appendToFile(errorLog, now.toISOString() + ' ' + line + '\n')
  console.log(`Error: ${msg} '${url}'`)
}

function skipPlaylist(filename) {
  let test_country = process.env.npm_config_country
  if (test_country && filename !== 'channels/' + test_country + '.m3u') {
    return true;
  }
  return false;
}
