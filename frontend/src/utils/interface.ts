export interface UserRegister {
  firstName: string;
  surname: string;
  username: string;
  email: string;
  password: string;
}

export interface FacebookResponse {
  access_token: string;
  facebook_access_token: string;
}

export interface FormData {
  accessToken: string;
  facebookAccessToken: string;
}

