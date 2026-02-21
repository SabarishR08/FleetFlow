export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export const formatDate = (value: string | Date) => {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
};

export const isExpired = (date: string | Date) => {
  const expiry = typeof date === "string" ? new Date(date) : date;
  return expiry.getTime() < Date.now();
};
