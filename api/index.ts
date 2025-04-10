import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { fetchPrayerTimesForCity, fetchCountries, fetchCities, fetchDistricts } from '../lib/getPrayerTimes'
import { createCalendarFromVakti } from '../lib/calendarHandler'
import { fetchYearlyPrayerTimesForCity } from '../lib/getYearlyPrayerTimes'

export const config = {
  runtime: 'edge'
}

const app = new Hono().basePath('/api')

app.get('/ulkeler', async (c) => {
  try {
    const countries = await fetchCountries();
    return c.json(countries);
  } catch (error) {
    return c.text('Error: Unable to fetch countries', 500);
  }
})

app.get('/sehirler/:countryId{[0-9]+}', async (c) => {
  try {
    const countryId = parseInt(c.req.param("countryId"));
    const cities = await fetchCities(countryId);
    return c.json(cities);
  } catch (error) {
    return c.text('Error: Unable to fetch cities', 500);
  }
})

app.get('/ilceler/:cityId{[0-9]+}', async (c) => {
  try {
    const cityId = parseInt(c.req.param("cityId"));
    const districts = await fetchDistricts(cityId);
    return c.json(districts);
  } catch (error) {
    return c.text('Error: Unable to fetch districts', 500);
  }
})

app.get('/vakti/:id{[0-9]+}/:timezone', async (c) => {
  const id = parseInt(c.req.param("id"));
  const timezone = c.req.param("timezone");
  const calendar = createCalendarFromVakti(await fetchPrayerTimesForCity(id), timezone);
  if (!calendar) {
    return c.text('Error: Unable to generate calendar', 500);
  }
  return c.newResponse(calendar, 200, {
    "content-type": "text/calendar"
  });
})

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
