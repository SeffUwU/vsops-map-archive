export const localStorageUtils = {
  getArrayFrom<T = unknown[]>(key: string): T {
    try {
      const savedData = localStorage.getItem(key);

      return savedData ? JSON.parse(savedData) : ([] as T);
    } catch (error) {
      return [] as T;
    }
  },
  pushToArray<T>(key: string, newItem: T, uniqueByProp?: keyof T): T {
    try {
      const currentArray = this.getArrayFrom<T[]>(key);
      const updatedArray = uniqueByProp
        ? currentArray.map((v) => (v[uniqueByProp] === newItem[uniqueByProp] ? newItem : v))
        : [...currentArray, newItem];

      localStorage.setItem(key, JSON.stringify(updatedArray));

      return newItem;
    } catch (error) {
      console.error(`Error updating ${key} in localStorage:`, error);
      throw error;
    }
  },
};
