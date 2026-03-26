export const localStorageUtils = {
  getArrayFrom<T = unknown[]>(key: string): T {
    try {
      const savedData = localStorage.getItem(key);

      return savedData ? JSON.parse(savedData) : [] as T;
    } catch (error) {
      return [] as T;
    }
  },
  pushToArray<T>(key: string, newItem: T) {
    try {
      const currentArray = this.getArrayFrom(key);
      const updatedArray = [...currentArray, newItem];

      localStorage.setItem(key, JSON.stringify(updatedArray));

      return updatedArray;
    } catch (error) {
      console.error(`Error updating ${key} in localStorage:`, error);
    }
  },
};
