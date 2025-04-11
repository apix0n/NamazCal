import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { fetchPrayerTimesForCity, fetchCountries, fetchCities, fetchDistricts } from '../lib/getPrayerTimes'
import { createCalendarFromVakti } from '../lib/calendarHandler'
import { fetchYearlyPrayerTimesForCity } from '../lib/getYearlyPrayerTimes'
import { endpointsCount } from '../lib/getPrayerTimes'

export const config = {
  runtime: 'edge'
}

const app = new Hono().basePath('/api')

app.get('/ulkeler', async (c) => {
  let error;
  for (let endpoint = 0; endpoint < endpointsCount + 1; endpoint++) {
    try {
      const countries = await fetchCountries(endpoint);
      return c.json(countries);
    } catch (e) {
      error = e;
      continue;
    }
  }
  return c.text('Error: Unable to fetch countries from any endpoint', 500);
});

app.get('/sehirler/:countryId{[0-9]+}', async (c) => {
  const countryId = parseInt(c.req.param("countryId"));
  let error;
  for (let endpoint = 0; endpoint < endpointsCount + 1; endpoint++) {
    try {
      const cities = await fetchCities(countryId, endpoint);
      return c.json(cities);
    } catch (e) {
      error = e;
      continue;
    }
  }
  return c.text('Error: Unable to fetch cities from any endpoint', 500);
});

app.get('/ilceler/:cityId{[0-9]+}', async (c) => {
  const cityId = parseInt(c.req.param("cityId"));
  let error;
  for (let endpoint = 0; endpoint < endpointsCount + 1; endpoint++) {
    try {
      const districts = await fetchDistricts(cityId, endpoint);
      return c.json(districts);
    } catch (e) {
      error = e;
      continue;
    }
  }
  return c.text('Error: Unable to fetch districts from any endpoint', 500);
});

app.get('/vakti/:id{[0-9]+}/:timezone', async (c) => {
  const id = parseInt(c.req.param("id"));
  const timezone = c.req.param("timezone");
  let error;
  for (let endpoint = 0; endpoint < endpointsCount + 1; endpoint++) {
    try {
      const prayerTimes = await fetchPrayerTimesForCity(id, endpoint);
      const calendar = createCalendarFromVakti(prayerTimes, timezone);
      if (!calendar) continue;
      return c.newResponse(calendar, 200, {
        "content-type": "text/calendar"
      });
    } catch (e) {
      error = e;
      continue;
    }
  }
  return c.text('Error: Unable to generate calendar from any endpoint', 500);
});

app.get('/vakti/:id{[0-9]+}/:timezone/yillik', async (c) => {
  const id = parseInt(c.req.param("id"));
  const timezone = c.req.param("timezone");
  const calendar = createCalendarFromVakti(await fetchYearlyPrayerTimesForCity(id), timezone);
  if (!calendar) {
    return c.text('Error: Unable to generate calendar', 500);
  }
  return c.newResponse(calendar, 200, {
    "content-type": "text/calendar"
  });
})

export default handle(app)
