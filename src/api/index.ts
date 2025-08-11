import axios  from 'axios';
const BASE_URL = 'https://lms-work.onrender.com';

export class Api {
    async LoginUser(data:{
        email: string;
        password: string;
    }) {
        try{
          const payload = {
            email: data.email,
            password: data.password,
          }
          const response = await axios.post(`${BASE_URL}/api/auth/login`,
            
              payload
            
          )
          return response;
        }catch(err: any){
          console.error("Error during login:", err);
          return err;
        }
    }
}