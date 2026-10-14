'use strict';

const DAY = 24 * 3600 * 1000;

function startOfDay(date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function addMonths(date, count) {
  const result = new Date(date.getTime());
  result.setUTCMonth(result.getUTCMonth() + count);
  return result;
}

function daysBetween(a, b) {
  return Math.round((startOfDay(b) - startOfDay(a)) / DAY);
}

function isoWeek(date) {
  const target = new Date(startOfDay(date));
  const dayNumber = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNumber + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const diff = daysBetween(firstThursday, target);
  return 1 + Math.floor((diff + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
}

function wateringRota(memberIds, start, weeks) {
  if (memberIds.length === 0) {
    return [];
  }
  const rota = [];
  for (let week = 0; week < weeks; week += 1) {
    const weekStart = new Date(startOfDay(start) + week * 7 * DAY);
    const entry = { week: isoWeek(weekStart), start: weekStart.toISOString().slice(0, 10), duty: [] };
    for (let slot = 0; slot < 2; slot += 1) {
      entry.duty.push(memberIds[(week * 2 + slot) % memberIds.length]);
    }
    rota.push(entry);
  }
  return rota;
}

function nextSeasonStart(date) {
  const march = Date.UTC(date.getUTCFullYear(), 2, 1);
  if (date.getTime() < march) {
    return new Date(march);
  }
  return new Date(Date.UTC(date.getUTCFullYear() + 1, 2, 1));
}

function renewalDate(joined, months) {
  return addMonths(joined, months);
}

module.exports = { DAY, startOfDay, addMonths, daysBetween, isoWeek, wateringRota, nextSeasonStart, renewalDate };
