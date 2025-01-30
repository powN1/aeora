export interface UserAuth {
  firstName: string;
  surname: string;
  email: string;
  accessToken: string;
}

export interface UserRegister {
  firstName: string;
  surname: string;
  email: string;
  password: string;
}

export interface UserLogin {
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

