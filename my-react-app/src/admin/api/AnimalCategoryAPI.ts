import api from "../../axious/axious";
import AnimalCategory from "../../models/AnimalCategory";
import { getToken } from "../../service/localStorageService";

interface ResultInterface {
    result: AnimalCategory[];
    pageTotal: number;
    totalElements: number;
}

export async function getAllAnimals(page: number, pageSize: number): Promise<ResultInterface | null> {
    const result: AnimalCategory[] = [];

    try {
        const response = await api.get(`/animals?page=${page}&size=${pageSize}`);
        
        if (response.data.code === 1000) {
            const responseData = response.data.result.data || []; 

            for (const item of responseData) {
                result.push({
                    id: item.id,
                    animalCategoryName: item.animalCategoryName,
                    description: item.description,
                    origin: item.origin,
                    status: item.status,
                    createdDate: item.createdDate,
                    createdBy: item.createdBy,
                    updatedBy: item.updatedBy,
                    colors: item.colors?.map((color: any) => ({
                        id: color.id,
                        color: color.color,
                        destiny: color.destiny ? {
                            id: color.destiny.id,
                            destiny: color.destiny.destiny,
                            directions: color.destiny.directions?.map((direction: any) => ({
                                id: direction.id,
                                direction: direction.direction
                            })) || [],
                            numbers: color.destiny.numbers?.map((number: any) => ({
                                id: number.id,
                                number: number.number
                            })) || []
                        } : null
                    })) || [],
                    animalImages: item.animalImages?.map((image: any) => ({
                        id: image.id,
                        imageUrl: image.imageUrl || ""
                    })) || [],
                });
            }

            const pageTotal: number = response.data.result.totalPages || 0;
            const totalElements: number = response.data.result.totalElements || 0;

            return {
                result: result,
                pageTotal: pageTotal,
                totalElements: totalElements,
            };
        } else {
            console.error("Failed to fetch data: ", response.data.message);
            return null;
        }
    } catch (error) {
        console.error("Error fetching animals: ", error);
        return null;
    }
}  
// Hàm tìm kiếm động vật theo category
export async function findByAnimalCategory(name: string, page: number, pageSize: number): Promise<ResultInterface | null> {
    const result: AnimalCategory[] = [];

    try {
        const response = await api.get(`/animals/animal-search?search=${name}&page=${page}&size=${pageSize}`);

        if (response.data.code === 1000) {
            const responseData = response.data.result.data;

            for (const item of responseData) {
                result.push({
                    id: item.id,
                    animalCategoryName: item.animalCategoryName,
                    description: item.description,
                    origin: item.origin,
                    status: item.status,
                    createdDate: item.createdDate,
                    createdBy: item.createdBy,
                    updatedDate: item.updatedDate,
                    updatedBy: item.updatedBy,
                    colors: item.colors.map((color: any) => ({
                        id: color.id,
                        color: color.color,
                        destiny: color.destiny ? {
                            id: color.destiny.id,
                            destiny: color.destiny.destiny,
                            directions: color.destiny.directions?.map((direction: any) => ({
                                id: direction.id,
                                direction: direction.direction
                            })) || [],
                            numbers: color.destiny.numbers?.map((number: any) => ({
                                id: number.id,
                                number: number.number
                            })) || []
                        } : null
                    })) || [],
                    animalImages: item.animalImages.map((image: any) => ({
                        id: image.id,
                        imageUrl: image.imageUrl,
                    })),
                });
            }

            const pageTotal: number = response.data.result.totalPages;
            const totalElements: number = response.data.result.totalElements;

            return {
                result: result,
                pageTotal: pageTotal,
                totalElements: totalElements,
            };
        } else {
            console.error("Failed to fetch data: ", response.data.message || response.status);
            return null;
        }
    } catch (error) {
        console.error("Error fetching animals: ", error);
        return null;
    }
}

export async function findByAnimalDestiny(destinyList: string[] = [], page: number, pageSize: number): Promise<ResultInterface | null> {
    const result: AnimalCategory[] = [];
  
    try {
      // Ensure destinyList is an array before attempting to join
      if (!Array.isArray(destinyList)) {
        throw new TypeError("Expected an array for destinyList");
      }
  
      // Convert destiny list to a comma-separated string
      const destinyQuery = destinyList.join(',');
  
      const response = await api.get(`/animals/animal-destiny?destiny=${destinyQuery}&page=${page}&size=${pageSize}`);
  
      if (response.data.code === 1000) {
        const responseData = response.data.result.data;
  
        for (const item of responseData) {
          result.push({
            id: item.id,
            animalCategoryName: item.animalCategoryName,
            description: item.description,
            origin: item.origin,
            status: item.status,
            createdDate: item.createdDate,
            createdBy: item.createdBy,
            updatedDate: item.updatedDate,
            updatedBy: item.updatedBy,
            colors: item.colors.map((color: any) => ({
              id: color.id,
              color: color.color,
              destiny: color.destiny ? {
                id: color.destiny.id,
                destiny: color.destiny.destiny,
                directions: color.destiny.directions?.map((direction: any) => ({
                  id: direction.id,
                  direction: direction.direction,
                })) || [],
                numbers: color.destiny.numbers?.map((number: any) => ({
                  id: number.id,
                  number: number.number,
                })) || [],
              } : null,
            })) || [],
            animalImages: item.animalImages.map((image: any) => ({
              id: image.id,
              imageUrl: image.imageUrl,
            })),
          });
        }
  
        const pageTotal: number = response.data.result.totalPages;
        const totalElements: number = response.data.result.totalElements;
  
        return {
          result: result,
          pageTotal: pageTotal,
          totalElements: totalElements,
        };
      } else {
        console.error("Failed to fetch data: ", response.data.message || response.status);
        return null;
      }
    } catch (error) {
      console.error("Error fetching animals: ", error);
      return null;
    }
  }
  export async function findByAnimalDestinyAndName(destinyList: string[] = [], name: string, page: number, pageSize: number): Promise<ResultInterface | null> {
    const result: AnimalCategory[] = [];
  
    try {
      // Ensure destinyList is an array before attempting to join
      if (!Array.isArray(destinyList)) {
        throw new TypeError("Expected an array for destinyList");
      }
  
      // Convert destiny list to a comma-separated string
      const destinyQuery = destinyList.join(',');
  
      const response = await api.get(`/animals/animal-destiny-name?destiny=${destinyQuery}&name=${name}&page=${page}&size=${pageSize}`);
  
      if (response.data.code === 1000) {
        const responseData = response.data.result.data;
  
        for (const item of responseData) {
          result.push({
            id: item.id,
            animalCategoryName: item.animalCategoryName,
            description: item.description,
            origin: item.origin,
            status: item.status,
            createdDate: item.createdDate,
            createdBy: item.createdBy,
            updatedDate: item.updatedDate,
            updatedBy: item.updatedBy,
            colors: item.colors.map((color: any) => ({
              id: color.id,
              color: color.color,
              destiny: color.destiny ? {
                id: color.destiny.id,
                destiny: color.destiny.destiny,
                directions: color.destiny.directions?.map((direction: any) => ({
                  id: direction.id,
                  direction: direction.direction,
                })) || [],
                numbers: color.destiny.numbers?.map((number: any) => ({
                  id: number.id,
                  number: number.number,
                })) || [],
              } : null,
            })) || [],
            animalImages: item.animalImages.map((image: any) => ({
              id: image.id,
              imageUrl: image.imageUrl,
            })),
          });
        }
  
        const pageTotal: number = response.data.result.totalPages;
        const totalElements: number = response.data.result.totalElements;
  
        return {
          result: result,
          pageTotal: pageTotal,
          totalElements: totalElements,
        };
      } else {
        console.error("Failed to fetch data: ", response.data.message || response.status);
        return null;
      }
    } catch (error) {
      console.error("Error fetching animals: ", error);
      return null;
    }
  }