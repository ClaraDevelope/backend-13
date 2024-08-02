const calculateNextCycle = (currentCycleEnd, averageCycleLength, averagePeriodLength) => {
  const nextCycleStart = new Date(currentCycleEnd.getTime() + averageCycleLength * 24 * 60 * 60 * 1000);
  const nextCycleEnd = new Date(nextCycleStart.getTime() + averagePeriodLength * 24 * 60 * 60 * 1000);
  return { start: nextCycleStart, end: nextCycleEnd };
};
module.exports = {calculateNextCycle};