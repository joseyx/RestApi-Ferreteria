export interface categoryInterface {
    categoryName: string;
}

export interface categoryChildInterface extends categoryInterface {
    parentCategoryId: number;
    parentCategory: string;
}
