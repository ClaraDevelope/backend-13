const parseDate = (dateString) => {
  const [day, month, year] = dateString.split('/');
  return new Date(Date.UTC(year, month - 1, day));
};


module.exports = {parseDate};