export interface productInterface {
    productName: string
    description: string
    categories: string[]
    keywords: string[]
    thumbnail: string
    photos: string[]
    sku: skuInterface
}

export interface skuInterface {
    sku: string
    price: number
    stock: number
    minStock: number
    expDate?: Date
}

export interface cartProductInterface {
    productId: number
    quantity: number
    totalPrice: number
}

interface file {
    fieldName: string
    originalName: string
    encoding: string
    mimetype: string
    destination: string
    filename: string
    path: string
    size: number
}

export interface files {
    thumbnail: Array<file>
    photos: Array<file>
}
