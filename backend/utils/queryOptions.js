const buildSort = (sortBy, order, allowedFields, defaultField) => {
  const field = allowedFields.includes(sortBy)
    ? sortBy
    : defaultField;

  const direction = order === "asc" ? 1 : -1;

  return { [field]: direction };
};

module.exports = { buildSort };