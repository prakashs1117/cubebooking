export const generateId = (): string => crypto.randomUUID();

export const generateRef = (): string => {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 90000) + 10000).padStart(5, '0');
  return `REQ-${year}-${num}`;
};
