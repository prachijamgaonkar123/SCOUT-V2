export const getOneHourBefore = (): {
  fullDate: string;
  time: string;
} => {
  const date = new Date();

  // subtract exactly 1 hour
  date.setTime(date.getTime() - 60 * 60 * 1000);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return {
    fullDate: `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`,
    time: `${hours}:${minutes}:${seconds}`,
  };
};

export const getOnehalftBefore = (): {
  fullDate: string;
  time: string;
} => {
  const date = new Date();

  // subtract 1 hour and add 30 minutes
  date.setTime(date.getTime() - 60 * 60 * 1000 + 30 * 60 * 1000);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return {
    fullDate: `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`,
    time: `${hours}:${minutes}:${seconds}`,
  };
};