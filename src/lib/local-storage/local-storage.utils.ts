export const localStorageUtils = {
  getArrayFrom<T = unknown[]>(key: string): T {
    try {
      const savedData = localStorage.getItem(key);

      return savedData ? JSON.parse(savedData) : ([] as T);
    } catch (error) {
      return [] as T;
    }
  },
  pushToArray<T>(key: string, newItem: T, uniqueByProp?: keyof T): T[] {
    try {
      const currentArray = this.getArrayFrom<T[]>(key);
      let updatedArray: T[];

      if (uniqueByProp) {
        const existingIndex = currentArray.findIndex((v) => v[uniqueByProp] === newItem[uniqueByProp]);
        if (existingIndex !== -1) {
          updatedArray = currentArray.map((v, idx) => (idx === existingIndex ? newItem : v));
        } else {
          updatedArray = [...currentArray, newItem];
        }
      } else {
        updatedArray = [...currentArray, newItem];
      }

      localStorage.setItem(key, JSON.stringify(updatedArray));

      return updatedArray;
    } catch (error) {
      console.error(`Error updating ${key} in localStorage:`, error);
      throw error;
    }
  },
};
