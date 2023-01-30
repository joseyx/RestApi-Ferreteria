export interface authInterface {
    email: string;
    password: string;
}

export interface userInterface extends authInterface {
    firstName: string;
    lastName: string;
    state: string;
    city: string;
    address: string;
    phoneNumber: string;
    role?: string
}

export interface userRole {
    role: string;
}
