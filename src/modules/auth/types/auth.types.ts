export interface LoginRequest{
    email: string;
    password: string;
};

export interface LoginResponseData{
    access_token: string;
    token_type: string;
}